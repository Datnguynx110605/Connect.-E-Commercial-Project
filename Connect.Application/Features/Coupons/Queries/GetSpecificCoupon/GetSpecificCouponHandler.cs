using Connect.Application.DTOs;
using Connect.Application.Interfaces.Persistences;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Coupons.Queries.GetSpecificCoupon
{
    internal sealed class GetSpecificCouponHandler : IRequestHandler<GetSpecificCouponQuery, CouponDto>
    {
        private readonly IUnitOfWork unitOfWork;
        public GetSpecificCouponHandler(IUnitOfWork _unitOfWork)
        {
            unitOfWork = _unitOfWork;
        }

        public async Task<CouponDto> Handle(GetSpecificCouponQuery request, CancellationToken cancellationToken)
        {
            var coupon = await unitOfWork.Coupons.GetByIdAsync(request.CouponID, cancellationToken);
            if (coupon == null)
                throw new Exception("Coupon not found");

            return new CouponDto
            {
                CouponCode = coupon.CouponCode.Value,
                DiscountAmount = coupon.DiscountAmount.Value,
                CouponQuantity = coupon.CouponQuantity.Value,
                ExpiryDate = coupon.ExpiryDate
            };
        }
    }
}
