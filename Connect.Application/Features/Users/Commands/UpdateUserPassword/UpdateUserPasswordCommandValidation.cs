using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Users.Commands.UpdateUserPassword
{
    internal sealed class UpdateUserPasswordCommandValidation:AbstractValidator<UpdateUserPasswordCommand>
    {
        public UpdateUserPasswordCommandValidation()
        {
            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required")
                .MaximumLength(15).WithMessage("Password is too long")
                .MinimumLength(5).WithMessage("Password is too short");

            RuleFor(x => x.OldPassword)
                .NotEmpty().WithMessage("Password is required");
        }
    }
}
