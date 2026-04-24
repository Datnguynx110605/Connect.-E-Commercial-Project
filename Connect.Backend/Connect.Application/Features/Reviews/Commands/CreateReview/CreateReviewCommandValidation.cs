using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Reviews.Commands.CreateReview
{
    internal sealed class CreateReviewCommandValidation:AbstractValidator<CreateReviewCommand>
    {
        public CreateReviewCommandValidation()
        {
            RuleFor(x => x.Rating)
                .NotEmpty().WithMessage("Rating is required")
                .GreaterThan(0).WithMessage("Rating is invalid");

            RuleFor(x => x.Body)
                .NotEmpty().WithMessage("Body is required")
                .MaximumLength(2000).WithMessage("Body is too long")
                .MinimumLength(5).WithMessage("Body is too short");
        }
    }
}
