using Connect.Application.Commons.DTOs;
using Connect.Application.Interfaces.Persistences;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Coupons.Queries.GetAllCoupons
{
    internal sealed class GetAllCouponsHandler : IRequestHandler<GetAllCouponsQuery, PagedResult<CouponDto>>
    {
        private readonly IUnitOfWork unitOfWork;
        public GetAllCouponsHandler(IUnitOfWork _unitOfWork)
        {
            unitOfWork = _unitOfWork;
        }

        public async Task<PagedResult<CouponDto>> Handle(GetAllCouponsQuery request, CancellationToken cancellationToken)
        {
            var (items, total) = await unitOfWork.Coupons.GetPagedAsync(request.Page, request.PageSize, cancellationToken: cancellationToken);

            return new PagedResult<CouponDto>
            {
                Items = items.Select(x => new CouponDto
                {
                    CouponID = x.CouponID,
                    CouponCode = x.CouponCode.Value,
                    DiscountAmount = x.DiscountAmount.Value,
                    CouponQuantity = x.CouponQuantity.Value,
                    MinimumPriceRequired = x.MinimumPriceRequired.Value,
                    ExpiryDate = x.ExpiryDate
                }).ToList(),
                TotalCount = total,
                Page = request.Page,
                PageSize = request.PageSize
            };
        }
    }
}
