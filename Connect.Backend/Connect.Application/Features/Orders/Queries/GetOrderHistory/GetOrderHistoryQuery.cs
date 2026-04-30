using Connect.Application.Commons.DTOs;
using MediatR;
using System.Collections.Generic;

namespace Connect.Application.Features.Orders.Queries.GetOrderHistory
{
    public sealed record GetOrderHistoryQuery(int Page = DefaultPagination.Page, int PageSize = DefaultPagination.PageSize) :IRequest<PagedResult<OrderDto>>
    {
    }
}
