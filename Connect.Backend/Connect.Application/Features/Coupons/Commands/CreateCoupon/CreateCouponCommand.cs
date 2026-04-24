using Connect.Application.Commons.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Coupons.Commands.CreateCoupon
{
    public sealed record CreateCouponCommand:IRequest<CouponDto>
    {
        public string CouponCode { get; init; }
        public decimal DiscountAmount { get; init; }
        public int CouponQuantity { get; init; }
        public DateTime ExpiryDate { get; init; }
    }
}
