using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Carts.Commands.AddToCart
{
    internal sealed class AddToCartCommandValidation:AbstractValidator<AddToCartCommand>
    {
        public AddToCartCommandValidation()
        {
            RuleFor(x => x.Quantity)
                .NotEmpty().WithMessage("Cart quantity is required")
                .GreaterThan(0).WithMessage("Invalid quantity")
                .LessThanOrEqualTo(10).WithMessage("Quantity is too much");
        }
    }
}
