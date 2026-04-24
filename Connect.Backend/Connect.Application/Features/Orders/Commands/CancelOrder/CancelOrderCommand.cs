using Connect.Application.Commons.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Orders.Commands.CancelOrder
{
    public sealed record CancelOrderCommand:IRequest<OrderDto>
    {
        public int OrderID { get; init; }
    }
}
