using Connect.Application.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Orders.Commands.MarkAsPaid
{
    public sealed record MarkAsPaidCommand:IRequest<OrderDto>
    {
        public int OrderID { get; }
        public string OrderPaymentStatus { get; init; }
    }
}
