using Connect.Application.Commons.DTOs;
using Connect.Application.Interfaces.Persistences;
using Connect.Domain.Core.Entities;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Orders.Queries.GetAllOrders
{
    internal sealed class GetAllOrdersHandler : IRequestHandler<GetAllOrdersQuery, PagedResult<OrderDto>>
    {
        private readonly IUnitOfWork unitOfWork;
        public GetAllOrdersHandler(IUnitOfWork _unitOfWork)
        {
            unitOfWork = _unitOfWork;
        }

        public async Task<PagedResult<OrderDto>> Handle(GetAllOrdersQuery request, CancellationToken cancellationToken)
        {
            var (items, total) = await unitOfWork.Orders.GetPagedAsync(request.Page, request.PageSize, cancellationToken: cancellationToken);

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
