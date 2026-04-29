using Connect.Application.Commons.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Coupons.Queries.GetAllCoupons
{
    public sealed record GetAllCouponsQuery(int Page = 1, int PageSize = 10): IRequest<PagedResult<CouponDto>>
    {
    }
}
