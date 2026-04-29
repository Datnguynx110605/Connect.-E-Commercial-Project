using Connect.Application.Commons.DTOs;
using Connect.Application.Interfaces.Persistences;
using Connect.Application.Interfaces.Services;
using MediatR;
using Microsoft.AspNetCore.Http.Features;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Connect.Application.Features.Orders.Queries.GetOrderHistory
{
    internal sealed class GetOrderHistoryHandler : IRequestHandler<GetOrderHistoryQuery, PagedResult<OrderDto>>
    {
        private readonly IUnitOfWork unitOfWork;
        private readonly ICurrentUserService currentUserService;
        public GetOrderHistoryHandler(IUnitOfWork _unitOfWork, ICurrentUserService _currentUserService)
        {
            unitOfWork = _unitOfWork;
            currentUserService = _currentUserService;
        }

        public async Task<PagedResult<OrderDto>> Handle(GetOrderHistoryQuery request, CancellationToken cancellationToken)
        {
            var identity = await unitOfWork.Users.AnyAsync(x => x.UserID == currentUserService.UserID, cancellationToken);
            if (!identity)
                throw new UnauthorizedAccessException("User is not in the system");

            var (items, total) = await unitOfWork.Orders.GetPagedAsync(request.Page, request.PageSize, filter: x => x.UserID == currentUserService.UserID, cancellationToken);
            if (!items.Any())
                throw new Exception("No orders found");

            return new PagedResult<OrderDto>
            {
                Items = items.Select(x => new OrderDto
                {
                    OrderID = x.OrderID,
                    UserID = x.UserID,
                    CouponID = x.CouponID,
                    OrderTotalItems = x.OrderTotalItems.Value,
                    OrderTotalItemPrice = x.OrderTotalItemPrice.Value,
                    OrderFinalPrice = x.OrderFinalPrice.Value,
                    OrderShippingMethod = x.OrderShippingMethod.ToString(),
                    OrderPaymentMethod = x.OrderPaymentMethod.ToString(),
                    OrderStatus = x.OrderStatus.ToString(),
                    OrderPaymentStatus = x.OrderPaymentStatus.ToString(),
                    OrderItems = x.OrderItems.Select(i => new OrderItemDto
                    {
                        ProductID = i.ProductID,
                        Quantity = i.Quantity.Value,
                        UnitPrice = i.UnitPrice.Value,
                    }).ToList(),
                    CreatedAt = x.CreatedAt
                }).ToList(),
                TotalCount = total,
                Page = request.Page,
                PageSize = request.PageSize
            };
        }
    }
}
