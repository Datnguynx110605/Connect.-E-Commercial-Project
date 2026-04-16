using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Products.Commands.CreateProduct
{
    internal sealed class CreateProductCommandValidation:AbstractValidator<CreateProductCommand>
    {
        public CreateProductCommandValidation()
        {
            RuleFor(x => x.CategoryID)
                .GreaterThan(0).WithMessage("CategoryID is invalid");

            RuleFor(x => x.ProductName)
                .NotEmpty().WithMessage("Product name is required")
                .MinimumLength(5).WithMessage("Product name is too short")
                .MaximumLength(100).WithMessage("Product name is too long")
                .Matches(@"[^\p{L}\p{N}\s\-\|]").WithMessage("Product name must not have special character");

            RuleFor(x => x.Description)
                .NotEmpty().WithMessage("Description is required")
                .MinimumLength(50).WithMessage("Description is too short")
                .MaximumLength(2000).WithMessage("Description is too long")
                .Matches(@"[^\p{L}\p{N}\s\-\|]").WithMessage("Description must not have special character");

            RuleFor(x => x.OriginalPrice)
                .NotEmpty().WithMessage("Original price is required")
                .GreaterThan(0).WithMessage("Original Price is invalid");

            RuleFor(x => x.FinalPrice)
                .NotEmpty().WithMessage("Final price is required")
                .GreaterThan(0).WithMessage("Final Price is invalid");

            RuleFor(x => x.Stock)
                .NotEmpty().WithMessage("Stock is required")
                .GreaterThan(0).WithMessage("Stock is invalid");

            RuleFor(x => x.Ram)
                .NotEmpty().WithMessage("Ram is required")
                .LessThanOrEqualTo(30).WithMessage("Ram is invalid")
                .GreaterThan(0).WithMessage("Ram is invalid");

            RuleFor(x => x.Rom)
                .NotEmpty().WithMessage("Rom is required")
                .LessThanOrEqualTo(7000).WithMessage("Rom is invalid")
                .GreaterThan(0).WithMessage("Rom is invalid");

            RuleFor(x => x.Color)
                .NotEmpty().WithMessage("Color is required");

            RuleFor(x => x.ImageURL)
                .NotEmpty().WithMessage("Color is required");
        }
    }
}
