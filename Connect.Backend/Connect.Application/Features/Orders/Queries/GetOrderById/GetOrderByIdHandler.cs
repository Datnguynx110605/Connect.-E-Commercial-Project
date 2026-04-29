using Connect.Application.Commons.DTOs;
using Connect.Application.Interfaces.Persistences;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Orders.Queries.GetOrderById
{
    internal sealed class GetOrderByIdHandler : IRequestHandler<GetOrderByIdQuery, OrderDto>
    {
        private readonly IUnitOfWork unitOfWork;
        public GetOrderByIdHandler(IUnitOfWork _unitOfWork)
        {
            unitOfWork = _unitOfWork;
        }

        public async Task<OrderDto> Handle(GetOrderByIdQuery request, CancellationToken cancellationToken)
        {
            var order = await unitOfWork.Orders.GetByIdAsync(request.OrderID, cancellationToken);
            if (order == null)
                throw new Exception("No orders found");

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
