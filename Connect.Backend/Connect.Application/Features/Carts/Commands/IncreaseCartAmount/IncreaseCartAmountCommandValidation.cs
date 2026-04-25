using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Carts.Commands.IncreaseCartAmount
{
    internal sealed class IncreaseCartAmountCommandValidation:AbstractValidator<IncreaseCartAmountCommand>
    {
        public IncreaseCartAmountCommandValidation()
        {
            RuleFor(x => x.Quantity)
               .NotEmpty().WithMessage("Cart quantity is required")
               .GreaterThan(0).WithMessage("Invalid quantity");
        }
    }
}
