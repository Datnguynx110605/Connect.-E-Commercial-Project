using Connect.Application.Commons.DTOs;
using Connect.Application.Interfaces.Persistences;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Orders.Commands.UpdateOrderStatusToShipping
{
    internal sealed class UpdateOrderStatusToShippingHandler : IRequestHandler<UpdateOrderStatusToShippingCommand, OrderDto>
    {
        private readonly IUnitOfWork unitOfWork;
        public UpdateOrderStatusToShippingHandler(IUnitOfWork _unitOfWork)
        {
            unitOfWork = _unitOfWork;
        }

        public async Task<OrderDto> Handle(UpdateOrderStatusToShippingCommand request, CancellationToken cancellationToken)
        {
            var order = await unitOfWork.Orders.GetByIdAsync(request.OrderID, cancellationToken);
            if (order == null)
                throw new Exception("Order not found");

            order.MarkOrderStatusToShipping();

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
