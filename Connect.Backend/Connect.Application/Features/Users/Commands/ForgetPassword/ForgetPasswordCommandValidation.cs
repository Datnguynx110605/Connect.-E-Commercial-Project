using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Users.Commands.ForgetPassword
{
    internal sealed class ForgetPasswordCommandValidation:AbstractValidator<ForgetPasswordCommand>
    {
        public ForgetPasswordCommandValidation()
        {
            RuleFor(x => x.RegistrationSessionToken)
            .NotEmpty().WithMessage("Registration session token is required.");

            RuleFor(x => x.NewPasswordHash)
                .NotEmpty().WithMessage("Password is required")
                .MaximumLength(15).WithMessage("Password is too long")
                .MinimumLength(5).WithMessage("Password is too short");
        }
    }
}
