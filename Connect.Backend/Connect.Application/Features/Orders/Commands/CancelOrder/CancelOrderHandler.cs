using Connect.Application.Commons.DTOs;
using Connect.Application.Interfaces.Persistences;
using Connect.Application.Interfaces.Services;
using Connect.Domain.Core.Entities;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Orders.Commands.CancelOrder
{
    internal sealed class CancelOrderHandler : IRequestHandler<CancelOrderCommand, OrderDto>
    {
        private readonly IUnitOfWork unitOfWork;
        private readonly ICurrentUserService currentUserService;
        public CancelOrderHandler(IUnitOfWork _unitOfWork, ICurrentUserService _currentUserService)
        {
            unitOfWork = _unitOfWork;
            currentUserService = _currentUserService;
        }

        public async Task<OrderDto> Handle(CancelOrderCommand request, CancellationToken cancellationToken)
        {
            bool identity = await unitOfWork.Users.AnyAsync(x => x.UserID == currentUserService.UserID, cancellationToken);
            if (!identity)
                throw new UnauthorizedAccessException("User is not in the system");

            var order = await unitOfWork.Orders.GetByIdAsync(request.OrderID, cancellationToken);
            if (order == null)
                throw new Exception("Order not found");

            if (currentUserService.UserID != order.UserID)
                throw new UnauthorizedAccessException("No permission to access");

            var productIDs = order.OrderItems.Select(x => x.ProductID).Distinct().ToList();
            var products = await unitOfWork.Products.WhereAsync(x => productIDs.Contains(x.ProductID), cancellationToken);

            await unitOfWork.BeginTransactionAsync(cancellationToken);
            foreach (var item in order.OrderItems)
            {
                var product = products.FirstOrDefault(p => p.ProductID == item.ProductID);
                if (product == null)
                    throw new Exception("Product not found");

                product.AddToStock(item.Quantity);
                unitOfWork.Products.Update(product);
            }

            order.CancelOrder();

            unitOfWork.Orders.Update(order);
            await unitOfWork.CommitTransactionAsync(cancellationToken);

            return new OrderDto
            {
                OrderID = order.OrderID,
                UserID = order.UserID,
                CouponID = order.CouponID,
                OrderTotalItems = order.OrderTotalItems.Value,
                OrderTotalItemPrice = order.OrderTotalItemPrice.Value,
                OrderFinalPrice = order.OrderFinalPrice.Value,
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
                CreatedAt = order.CreatedAt
            };
        }
    }
}
