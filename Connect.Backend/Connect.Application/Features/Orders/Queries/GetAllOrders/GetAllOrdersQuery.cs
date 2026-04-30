using Connect.Application.Commons.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Orders.Queries.GetAllOrders
{
    public sealed record GetAllOrdersQuery(int Page = DefaultPagination.Page, int PageSize = DefaultPagination.PageSize) : IRequest<PagedResult<OrderDto>>
    {
    }
}
