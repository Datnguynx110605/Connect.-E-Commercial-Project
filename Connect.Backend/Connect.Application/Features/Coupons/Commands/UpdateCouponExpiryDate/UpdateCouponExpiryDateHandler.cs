using Connect.Application.DTOs;
using Connect.Application.Interfaces.Persistences;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Coupons.Commands.UpdateCouponExpiryDate
{
    internal sealed class UpdateCouponExpiryDateHandler : IRequestHandler<UpdateCouponExpiryDateCommand, CouponDto>
    {
        private readonly IUnitOfWork unitOfWork;
        public UpdateCouponExpiryDateHandler(IUnitOfWork _unitOfWork)
        {
            unitOfWork = _unitOfWork;
        }

        public async Task<CouponDto> Handle(UpdateCouponExpiryDateCommand request, CancellationToken cancellationToken)
        {
            var coupon = await unitOfWork.Coupons.GetByIdAsync(request.CouponID, cancellationToken);
            if (coupon == null)
                throw new Exception("Coupon not found");

            coupon.UpdateCouponExpiryDate(request.ExpiryDate);

            unitOfWork.Coupons.Update(coupon);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            return new CouponDto
            {
                CouponID = coupon.CouponID,
                CouponCode = coupon.CouponCode.Value,
                DiscountAmount = coupon.DiscountAmount.Value,
                CouponQuantity = coupon.CouponQuantity.Value,
                ExpiryDate = coupon.ExpiryDate
            };
        }
    }
}
