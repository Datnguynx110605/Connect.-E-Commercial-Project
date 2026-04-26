using Connect.Application.Commons.DTOs;
using Connect.Application.Interfaces.Persistences;
using Connect.Application.Interfaces.Services;
using Connect.Domain.Core.Entities;
using Connect.Domain.Core.Enums;
using Connect.Domain.Core.ValueObjects;
using Hangfire;
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
        private readonly IBackgroundJobClient backgroundJobClient;
        public CreateOrderHandler(IUnitOfWork _unitOfWork, ICurrentUserService _currentUserService, IBackgroundJobClient _backgroundJobClient)
        {
            unitOfWork = _unitOfWork;
            currentUserService = _currentUserService;
            backgroundJobClient = _backgroundJobClient;
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

            ShippingMethod shipMethod = Enum.Parse<ShippingMethod>(request.OrderShippingMethod.ToString());
            PaymentMethod payMethod = Enum.Parse<PaymentMethod>(request.OrderPaymentMethod.ToString());

            var orderItems = new List<OrderItem>();
            foreach (var item in request.items)
            {
                var product = products.Single(x => x.ProductID == item.ProductID);
                Amount quantity = Amount.Create(item.Quantity);
                product.RemoveFromStock(quantity);

                if (product.Stock.Value <= 5)
                    backgroundJobClient.Enqueue<INotificationService>(notificationService => notificationService.NotifyLowStockAsync(
                        product.ProductID,
                        product.ProductName.Value,
                        product.Stock.Value,
                        CancellationToken.None));

                orderItems.Add(OrderItem.CreateOrderItem(product.ProductID, product.FinalPrice, quantity));
            }

            Coupon? coupon = null;
            Currency discountAmount = Currency.Create(0);
            if (request.CouponID.HasValue)
            {
                coupon = await unitOfWork.Coupons.FirstOrDefaultAsync(x => x.CouponID == request.CouponID, cancellationToken);
                if (coupon == null)
                    throw new Exception("Coupon not found");

                discountAmount = coupon.DiscountAmount;
            }

            Order order = Order.CreateOrder(currentUserService.UserID, coupon?.CouponID ?? 0, shipMethod, payMethod, orderItems, discountAmount);

            coupon?.UseCoupon(order.OrderTotalPrice);

            await unitOfWork.BeginTransactionAsync(cancellationToken);
            unitOfWork.Products.UpdateRange(products);
            if (coupon != null)
               unitOfWork.Coupons.Update(coupon);
            await unitOfWork.Orders.AddAsync(order, cancellationToken);
            await unitOfWork.CommitTransactionAsync(cancellationToken);

            return new OrderDto
            {
                OrderID=order.OrderID,
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
                }).ToList(),
                CreatedAt=order.CreatedAt
            };
        }
    }
}
