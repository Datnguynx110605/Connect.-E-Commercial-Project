using FluentValidation;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Categories.Commands.CreateCategory
{
    internal sealed class CreateCategoryCommandValidation:AbstractValidator<CreateCategoryCommand>
    {
        public CreateCategoryCommandValidation()
        {
            RuleFor(x => x.CategoryName)
                .NotEmpty().WithMessage("Category name is required")
                .MinimumLength(2).WithMessage("Category name is too short")
                .MaximumLength(10).WithMessage("Category name is too long")
                .Matches(@"\W").WithMessage("Category name is invalid");
        }
    }
}
