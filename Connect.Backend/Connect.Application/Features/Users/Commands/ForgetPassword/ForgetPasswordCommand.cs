using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Users.Commands.ForgetPassword
{
    public sealed record ForgetPasswordCommand:IRequest<string>
    {
        public string RegistrationSessionToken { get; }
        public string NewPasswordHash { get; init; }
    }
}
