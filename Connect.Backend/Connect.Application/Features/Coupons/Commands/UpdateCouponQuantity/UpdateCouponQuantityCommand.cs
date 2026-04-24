using Connect.Application.Commons.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Coupons.Commands.UpdateCouponQuantity
{
    public sealed record UpdateCouponQuantityCommand:IRequest<CouponDto>
    {
        public int CouponID { get; init; }
        public int CouponQuantity { get; init; }
    }
}
