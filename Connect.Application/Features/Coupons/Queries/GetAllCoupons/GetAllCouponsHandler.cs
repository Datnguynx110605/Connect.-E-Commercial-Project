using Connect.Application.DTOs;
using Connect.Application.Interfaces.Persistences;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Coupons.Queries.GetAllCoupons
{
    internal sealed class GetAllCouponsHandler : IRequestHandler<GetAllCouponsQuery, IEnumerable<CouponDto>>
    {
        private readonly IUnitOfWork unitOfWork;
        public GetAllCouponsHandler(IUnitOfWork _unitOfWork)
        {
            unitOfWork = _unitOfWork;
        }

        public async Task<IEnumerable<CouponDto>> Handle(GetAllCouponsQuery request, CancellationToken cancellationToken)
        {
            var coupon = await unitOfWork.Coupons.GetAllNoTrackingAsync(cancellationToken);
            if (coupon == null)
                throw new Exception("Coupon not found");

            return coupon.Select(x => new CouponDto
            {
                CouponCode = x.CouponCode.Value,
                DiscountAmount = x.DiscountAmount.Value,
                CouponQuantity = x.CouponQuantity.Value,
                ExpiryDate = x.ExpiryDate
            });
        }
    }
}
