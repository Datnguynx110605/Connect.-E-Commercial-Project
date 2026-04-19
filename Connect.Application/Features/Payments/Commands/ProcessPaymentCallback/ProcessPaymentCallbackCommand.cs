using FluentResults;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Payments.Commands.ProcessPaymentCallback
{
    public sealed record ProcessPaymentCallbackCommand:IRequest<Result>
    {
        public int OrderID { get; init; }
        public string PaymentGatewayID { get; init; }
        public decimal TotalAmount { get; init; }
        public bool IsPaidSuccess { get; init; }
        public string? ErrorCode { get; init; }
    }
}
