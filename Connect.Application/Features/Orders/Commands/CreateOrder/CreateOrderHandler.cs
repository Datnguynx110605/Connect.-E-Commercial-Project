using Connect.Application.DTOs;
using Connect.Application.Interfaces.Persistences;
using Connect.Application.Interfaces.Services;
using Connect.Domain.Core.Entities;
using Connect.Domain.Core.Enums;
using Connect.Domain.Core.ValueObjects;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Orders.Commands.CreateOrder
{
    internal sealed class CreateOrderHandler : IRequestHandler<CreateOrderCommand, OrderDto>
    {
        private readonly IUnitOfWork unitOfWork;
        private readonly ICurrentUserService currentUserService;
        public CreateOrderHandler(IUnitOfWork _unitOfWork, ICurrentUserService _currentUserService)
        {
            unitOfWork = _unitOfWork;
            currentUserService = _currentUserService;
        }

        public async Task<OrderDto> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
        {
            bool identity = await unitOfWork.Users.AnyAsync(x => x.UserID == currentUserService.UserID, cancellationToken);
            if (!identity)
                throw new UnauthorizedAccessException("User is not in the system");

            var productIDs = request.items.Select(x => x.ProductID).ToList();
            var products = await unitOfWork.Products.WhereAsync(x => productIDs.Contains(x.ProductID), cancellationToken);
            if (!products.Any() || products.Count() != request.items.Count)
                throw new Exception("Products not found");

            Coupon? coupon = null;
            Currency discountAmount = Currency.Create(0);
            if (request.CouponID.HasValue)
            {
                coupon = await unitOfWork.Coupons.FirstOrDefaultAsync(x => x.CouponID == request.CouponID, cancellationToken);
                if (coupon == null)
                    throw new Exception("Coupon not found");

                discountAmount = coupon.DiscountAmount;
                coupon.UseCoupon();
            }

            ShippingMethod shipMethod = Enum.Parse<ShippingMethod>(request.OrderShippingMethod.ToString());
            PaymentMethod payMethod = Enum.Parse<PaymentMethod>(request.OrderPaymentMethod.ToString());

            var orderItems = new List<OrderItem>();
            foreach (var item in request.items)
            {
                var product = products.Single(x => x.ProductID == item.ProductID);
                Amount quantity = Amount.Create(item.Quantity);
                product.RemoveFromStock(quantity);

                orderItems.Add(OrderItem.CreateOrderItem(product.ProductID, product.FinalPrice, quantity));
            }

            Order order = Order.CreateOrder(currentUserService.UserID, coupon.CouponID, shipMethod, payMethod, orderItems, discountAmount);

            await unitOfWork.BeginTransactionAsync(cancellationToken);
            unitOfWork.Products.UpdateRange(products);
            if (coupon != null)
               unitOfWork.Coupons.Update(coupon);
            await unitOfWork.Orders.AddAsync(order, cancellationToken);
            await unitOfWork.CommitTransactionAsync(cancellationToken);

            return new OrderDto
            {
                UserID = order.UserID,
                CouponID = order.CouponID,
                OrderTotalPrice = order.OrderTotalPrice.Value,
                OrderTotalItems = order.OrderTotalItems.Value,
                OrderShippingMethod = order.OrderShippingMethod.ToString(),
                OrderPaymentMethod = order.OrderPaymentMethod.ToString(),
                OrderStatus = order.OrderStatus.ToString(),
                OrderPaymentStatus = order.OrderPaymentStatus.ToString(),
                OrderItems = order.OrderItems.Select(x => new OrderItemDto
                {
                    ProductID = x.ProductID,
                    Quantity = x.Quantity.Value,
                    UnitPrice = x.UnitPrice.Value,
                }).ToList()
            };
        }
    }
}
