using Connect.Application.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Orders.Queries.GetOrderHistory
{
    public sealed record GetOrderHistoryQuery:IRequest<OrderDto>
    {
    }
}
