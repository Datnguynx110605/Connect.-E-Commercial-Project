using Connect.Application.DTOs;
using Connect.Application.Interfaces.Persistences;
using Connect.Application.Interfaces.Services;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Orders.Queries.GetOrderHistory
{
    internal sealed class GetOrderHistoryHandler : IRequestHandler<GetOrderHistoryQuery, OrderDto>
    {
        private readonly IUnitOfWork unitOfWork;
        private readonly ICurrentUserService currentUserService;
        public GetOrderHistoryHandler(IUnitOfWork _unitOfWork, ICurrentUserService _currentUserService)
        {
            unitOfWork = _unitOfWork;
            currentUserService = _currentUserService;
        }

        public async Task<OrderDto> Handle(GetOrderHistoryQuery request, CancellationToken cancellationToken)
        {
            bool identity = await unitOfWork.Users.AnyAsync(x => x.UserID == currentUserService.UserID, cancellationToken);
            if (!identity)
                throw new UnauthorizedAccessException("User is not in the system");

            var order = await unitOfWork.Orders.GetByIdAsync(currentUserService.UserID, cancellationToken);
            if (order == null)
                throw new Exception("Order not found");

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
                OrderItems = order.OrderItems.ToList()
            };
        }
    }
}
