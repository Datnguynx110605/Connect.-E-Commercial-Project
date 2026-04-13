using Connect.Application.DTOs;
using Connect.Application.Interfaces.Persistences;
using Connect.Domain.Core.Entities;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Orders.Queries.GetAllOrders
{
    internal sealed class GetAllOrdersHandler : IRequestHandler<GetAllOrdersQuery, IEnumerable<OrderDto>>
    {
        private readonly IUnitOfWork unitOfWork;
        public GetAllOrdersHandler(IUnitOfWork _unitOfWork)
        {
            unitOfWork = _unitOfWork;
        }

        public async Task<IEnumerable<OrderDto>> Handle(GetAllOrdersQuery request, CancellationToken cancellationToken)
        {
            var order = await unitOfWork.Orders.GetAllNoTrackingAsync(cancellationToken);
            if (order == null)
                throw new Exception("Order not found");

            return order.Select(x => new OrderDto
            {
                UserID=x.UserID,
                CouponID=x.CouponID,
                OrderTotalPrice=x.OrderTotalPrice.Value,
                OrderTotalItems=x.OrderTotalItems.Value,
                OrderShippingMethod=x.OrderShippingMethod.ToString(),
                OrderPaymentMethod=x.OrderPaymentMethod.ToString(),
                OrderStatus=x.OrderStatus.ToString(),
                OrderPaymentStatus=x.OrderPaymentStatus.ToString(),
                OrderItems= x.OrderItems.Select(x => new OrderItemDto
                {
                    ProductID = x.ProductID,
                    Quantity = x.Quantity.Value,
                    UnitPrice = x.UnitPrice.Value,
                }).ToList()
            });
        }
    }
}
