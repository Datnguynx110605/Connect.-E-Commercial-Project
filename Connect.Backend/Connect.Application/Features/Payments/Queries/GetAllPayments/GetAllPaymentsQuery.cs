using Connect.Application.Commons.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Payments.Queries.GetAllPayments
{
    public sealed record GetAllPaymentsQuery(int Page = 1, int PageSize = 10): IRequest<PagedResult<PaymentDto>>
    {
    }
}
