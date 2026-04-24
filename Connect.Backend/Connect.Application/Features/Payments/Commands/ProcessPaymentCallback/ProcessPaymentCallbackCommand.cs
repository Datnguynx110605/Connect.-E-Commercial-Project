using FluentResults;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Payments.Commands.ProcessPaymentCallback
{
    public sealed record ProcessPaymentCallbackCommand:IRequest<Result>
    {
        public long PaymentID { get; init; }
        public int OrderID { get; init; }
        public string PaymentType { get; init; }
        public long TransactionID { get; init; }
        public string BankingInfo { get; init; }
        public bool IsPaidSuccess { get; init; }
        public DateTime PaidAt { get; init; }
    }
}
