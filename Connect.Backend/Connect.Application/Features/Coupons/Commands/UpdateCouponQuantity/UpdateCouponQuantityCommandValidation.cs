using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Coupons.Commands.UpdateCouponQuantity
{
    internal sealed class UpdateCouponQuantityCommandValidation:AbstractValidator<UpdateCouponQuantityCommand>
    {
        public UpdateCouponQuantityCommandValidation()
        {
            RuleFor(x => x.CouponQuantity)
                 .NotEmpty().WithMessage("Coupon quantity is required")
                 .GreaterThan(0).WithMessage("Coupon quantity is invalid");
        }
    }
}
