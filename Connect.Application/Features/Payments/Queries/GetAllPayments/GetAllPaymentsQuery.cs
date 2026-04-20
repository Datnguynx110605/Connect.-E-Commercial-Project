using Connect.Application.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Payments.Queries.GetAllPayments
{
    public sealed record GetAllPaymentsQuery:IRequest<IEnumerable<PaymentDto>>
    {
    }
}
