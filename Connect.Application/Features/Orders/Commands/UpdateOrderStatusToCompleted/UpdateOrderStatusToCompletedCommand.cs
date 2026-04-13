using Connect.Application.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Orders.Commands.UpdateOrderStatusToCompleted
{
    public sealed record UpdateOrderStatusToCompletedCommand:IRequest<OrderDto>
    {
        public int OrderID { get; }
        public string OrderStatus { get; init; }
    }
}
