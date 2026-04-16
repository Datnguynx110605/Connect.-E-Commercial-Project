using Connect.Application.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Coupons.Queries.GetSpecificCoupon
{
    public sealed record GetSpecificCouponQuery:IRequest<CouponDto>
    {
        public int CouponID { get; init; }
    }
}
