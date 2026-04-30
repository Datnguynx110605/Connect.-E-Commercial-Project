using Connect.Application.Commons.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Payments.Queries.GetSpecificPayment
{
    public sealed record GetSpecificPaymentQuery:IRequest<PaymentDto>
    {
        public long PaymentID { get; init; }
    }
}
