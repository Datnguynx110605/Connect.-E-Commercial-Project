using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Reviews.Commands.UpdateReview
{
    internal sealed class UpdateReviewCommandValidation:AbstractValidator<UpdateReviewCommand>
    {
        public UpdateReviewCommandValidation()
        {
            RuleFor(x => x.Rating)
               .GreaterThan(0).WithMessage("Rating is invalid");

            RuleFor(x => x.Body)
                .MaximumLength(300).WithMessage("Body is too long")
                .MinimumLength(5).WithMessage("Body is too short");
        }
    }
}
