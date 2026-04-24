using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Users.Commands.CheckEmail
{
    internal sealed class CheckEmailCommandValidation:AbstractValidator<CheckEmailCommand>
    {
        public CheckEmailCommandValidation()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required")
                .EmailAddress().WithMessage("Invalid Email");
        }
    }
}
