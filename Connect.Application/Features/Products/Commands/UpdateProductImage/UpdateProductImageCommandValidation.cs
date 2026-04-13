using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Products.Commands.UpdateProductImage
{
    internal sealed class UpdateProductImageCommandValidation:AbstractValidator<UpdateProductImageCommand>
    {
        public UpdateProductImageCommandValidation()
        {
            RuleFor(x => x.ImageURL)
                .NotEmpty().WithMessage("Color is required");
        }
    }
}
