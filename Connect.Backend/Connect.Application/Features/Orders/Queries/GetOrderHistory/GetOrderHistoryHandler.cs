using Connect.Application.Commons.DTOs;
using Connect.Application.Interfaces.Persistences;
using Connect.Application.Interfaces.Services;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Connect.Application.Features.Orders.Queries.GetOrderHistory
{
    internal sealed class GetOrderHistoryHandler : IRequestHandler<GetOrderHistoryQuery, IEnumerable<OrderDto>>
    {
        private readonly IUnitOfWork unitOfWork;
        private readonly ICurrentUserService currentUserService;
        public GetOrderHistoryHandler(IUnitOfWork _unitOfWork, ICurrentUserService _currentUserService)
        {
            unitOfWork = _unitOfWork;
            currentUserService = _currentUserService;
        }

        public async Task<IEnumerable<OrderDto>> Handle(GetOrderHistoryQuery request, CancellationToken cancellationToken)
        {
            var orders = await unitOfWork.Orders.GetAllNoTrackingAsync(cancellationToken);
            var userOrders = orders.Where(x => x.UserID == currentUserService.UserID);

            return userOrders.Select(order => new OrderDto
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
            });
        }
    }
}
