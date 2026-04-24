using FluentResults;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Payments.Commands.CreatePayment
{
    public sealed record CreatePaymentCommand:IRequest<Result<string>>
    {
        public int OrderID { get; init; }
    }
}
