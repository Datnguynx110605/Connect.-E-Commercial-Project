using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Users.Commands.RegisterUser
{
    internal sealed class RegisterUserCommandValidation:AbstractValidator<RegisterUserCommand>
    {
        public RegisterUserCommandValidation()
        {
            RuleFor(x => x.UserName)
                .NotEmpty().WithMessage("UserName is required")
                .MinimumLength(5).WithMessage("UserName is too short")
                .MaximumLength(10).WithMessage("UserName is too long")
                .Matches(@"^[a-z]+$").WithMessage("UserName must only contain lowercase letters");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required")
                .EmailAddress().WithMessage("Invalid Email");

            RuleFor(x => x.PhoneNumber)
                .NotEmpty().WithMessage("Phone number is required")
                .MaximumLength(10).WithMessage("Phone is invalid")
                .MinimumLength(10).WithMessage("Phone is invalid");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required")
                .MaximumLength(15).WithMessage("Password is too long")
                .MinimumLength(5).WithMessage("Password is too short");

            RuleFor(x => x.Address)
                .NotEmpty().WithMessage("Address is required")
                .MinimumLength(10).WithMessage("Please enter full address details");
        }
    }
}
