using Connect.Application.Commons.DTOs;
using Connect.Application.Interfaces.Persistences;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Orders.Commands.UpdateOrderStatusToCompleted
{
    internal sealed class UpdateOrderStatusToCompletedHandler : IRequestHandler<UpdateOrderStatusToCompletedCommand, OrderDto>
    {
        private readonly IUnitOfWork unitOfWork;
        public UpdateOrderStatusToCompletedHandler(IUnitOfWork _unitOfWork)
        {
            unitOfWork = _unitOfWork;
        }

        public async Task<OrderDto> Handle(UpdateOrderStatusToCompletedCommand request, CancellationToken cancellationToken)
        {
            var order = await unitOfWork.Orders.GetByIdAsync(request.OrderID, cancellationToken);
            if (order == null)
                throw new Exception("Order not found");

            order.MarkOrderStatusToCompleted();

            unitOfWork.Orders.Update(order);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            return new OrderDto
            {
                OrderID = order.OrderID,
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
                CreatedAt = order.CreatedAt
            };
        }
    }
}
