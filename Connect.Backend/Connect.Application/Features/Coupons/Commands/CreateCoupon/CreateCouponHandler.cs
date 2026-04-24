using Connect.Application.Commons.DTOs;
using Connect.Application.Interfaces.Persistences;
using Connect.Domain.Core.Entities;
using Connect.Domain.Core.ValueObjects;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Text;

namespace Connect.Application.Features.Coupons.Commands.CreateCoupon
{
    internal sealed class CreateCouponHandler : IRequestHandler<CreateCouponCommand, CouponDto>
    {
        private readonly IUnitOfWork unitOfWork;
        public CreateCouponHandler(IUnitOfWork _unitOfWork)
        {
            unitOfWork = _unitOfWork;
        }

        public async Task<CouponDto> Handle(CreateCouponCommand request, CancellationToken cancellationToken)
        {
            Code code = Code.Create(request.CouponCode);
            Currency discountAmount = Currency.Create(request.DiscountAmount);
            Amount quantity = Amount.Create(request.CouponQuantity);
            DateTime expiryDate = request.ExpiryDate;

            Coupon coupon = Coupon.CreateCoupon(code, discountAmount, quantity, expiryDate);

            await unitOfWork.Coupons.AddAsync(coupon, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            return new CouponDto
            {
                CouponID=coupon.CouponID,
                CouponCode = coupon.CouponCode.Value,
                DiscountAmount = coupon.DiscountAmount.Value,
                CouponQuantity = coupon.CouponQuantity.Value,
                ExpiryDate = coupon.ExpiryDate
            };
        }
    }
}
