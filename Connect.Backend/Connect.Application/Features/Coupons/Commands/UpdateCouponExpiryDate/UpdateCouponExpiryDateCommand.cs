using Connect.Application.Commons.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Coupons.Commands.UpdateCouponExpiryDate
{
    public sealed record UpdateCouponExpiryDateCommand:IRequest<CouponDto>
    {
        public int CouponID { get; init; }
        public DateTime ExpiryDate { get; init; }
    }
}
