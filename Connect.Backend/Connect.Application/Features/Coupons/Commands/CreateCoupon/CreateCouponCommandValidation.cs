using FluentValidation;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Coupons.Commands.CreateCoupon
{
    internal sealed class CreateCouponCommandValidation:AbstractValidator<CreateCouponCommand>
    {
        public CreateCouponCommandValidation()
        {
            RuleFor(x => x.CouponCode)
                .NotEmpty().WithMessage("Coupon code is required");

            RuleFor(x => x.DiscountAmount)
                .NotEmpty().WithMessage("Discount amount is required")
                .GreaterThan(0).WithMessage("Discount amount is invalid")
                .LessThanOrEqualTo(100).WithMessage("Discount amount is invalid");

            RuleFor(x => x.CouponQuantity)
                .NotEmpty().WithMessage("Coupon quantity is required")
                .GreaterThan(0).WithMessage("Coupon quantity is invalid");

            RuleFor(x => x.MimimumPriceRequired)
                .NotEmpty().WithMessage("Mimimum price is required")
                .GreaterThan(0).WithMessage("Minimum price is invalid");
        }
    }
}
