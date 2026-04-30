using Connect.Application.Commons.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Orders.Queries.GetOrderById
{
    public sealed record GetSpecificOrderQuery:IRequest<OrderDto>
    {
        public int OrderID { get; init; }
    }
}
