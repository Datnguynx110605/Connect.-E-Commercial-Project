using Connect.Application.Commons.DTOs;
using MediatR;
using System.Collections.Generic;

namespace Connect.Application.Features.Orders.Queries.GetOrderHistory
{
    public sealed record GetOrderHistoryQuery(int Page = 1, int PageSize = 10):IRequest<PagedResult<OrderDto>>
    {
    }
}
