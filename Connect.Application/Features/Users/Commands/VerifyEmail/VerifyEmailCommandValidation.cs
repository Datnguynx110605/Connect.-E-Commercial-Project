using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Users.Commands.VerifyEmail
{
    internal sealed class VerifyEmailCommandValidation:AbstractValidator<VerifyEmailCommand>
    {
        public VerifyEmailCommandValidation()
        {
            RuleFor(x => x.VerificationToken)
            .NotEmpty().WithMessage("Verification token is required.");
        }
    }
}
