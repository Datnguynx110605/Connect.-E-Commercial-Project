using Connect.Application.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Orders.Commands.UpdateOrderStatusToShipping
{
    public sealed record UpdateOrderStatusToShippingCommand:IRequest<OrderDto>
    {
        public int OrderID { get; }
        public string OrderStatus { get; init; }
    }
}
