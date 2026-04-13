using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Carts.Commands.ReduceCartAmount
{
    internal sealed class ReduceCartAmountCommandValidation:AbstractValidator<ReduceCartAmountCommand>
    {
        public ReduceCartAmountCommandValidation()
        {
            RuleFor(x => x.Quantity)
                .NotEmpty().WithMessage("Cart quantity is required")
                .GreaterThan(0).WithMessage("Invalid quantity");
        }
    }
}
