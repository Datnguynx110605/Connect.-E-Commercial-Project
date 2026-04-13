using Connect.Application.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Orders.Queries.GetAllOrders
{
    public sealed record GetAllOrdersQuery:IRequest<IEnumerable<OrderDto>>
    {
    }
}
