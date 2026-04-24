using Connect.Application.DTOs;
using Connect.Application.Interfaces.Persistences;
using Connect.Domain.Core.ValueObjects;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Coupons.Commands.UpdateCouponQuantity
{
    internal sealed class UpdateCouponQuantityHandler : IRequestHandler<UpdateCouponQuantityCommand, CouponDto>
    {
        private readonly IUnitOfWork unitOfWork;
        public UpdateCouponQuantityHandler(IUnitOfWork _unitOfWork)
        {
            unitOfWork = _unitOfWork;
        }

        public async Task<CouponDto> Handle(UpdateCouponQuantityCommand request, CancellationToken cancellationToken)
        {
            var coupon = await unitOfWork.Coupons.GetByIdAsync(request.CouponID, cancellationToken);
            if (coupon == null)
                throw new Exception("Coupon not found");

            coupon.UpdateCouponQuantity(Amount.Create(request.CouponQuantity));

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
