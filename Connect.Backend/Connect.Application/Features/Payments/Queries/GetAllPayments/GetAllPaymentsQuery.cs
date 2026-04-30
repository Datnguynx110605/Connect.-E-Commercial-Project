using Connect.Application.Commons.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Payments.Queries.GetAllPayments
{
    public sealed record GetAllPaymentsQuery(int Page = DefaultPagination.Page, int PageSize = DefaultPagination.PageSize) : IRequest<PagedResult<PaymentDto>>
    {
    }
}
