using Connect.Application.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Coupons.Commands.UpdateCouponExpiryDate
{
    public sealed record UpdateCouponExpiryDateCommand:IRequest<CouponDto>
    {
        public int CouponID { get; }
        public DateTime ExpiryDate { get; init; }
    }
}
