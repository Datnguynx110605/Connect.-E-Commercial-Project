using Connect.Application.Commons.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Orders.Commands.MarkAsPaid
{
    public sealed record MarkAsPaidCommand:IRequest<OrderDto>
    {
        public int OrderID { get; init; }
        public string OrderPaymentStatus { get; init; }
    }
}
