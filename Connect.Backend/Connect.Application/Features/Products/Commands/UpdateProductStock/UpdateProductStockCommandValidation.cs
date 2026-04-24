using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Products.Commands.UpdateProductStock
{
    internal sealed class UpdateProductStockCommandValidation:AbstractValidator<UpdateProductStockCommand>
    {
        public UpdateProductStockCommandValidation()
        {
            RuleFor(x => x.Stock)
                .NotEmpty().WithMessage("Stock is required")
                .GreaterThan(0).WithMessage("Stock is invalid");
        }
    }
}
