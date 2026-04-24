using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Users.Commands.UpdateUserPassword
{
    public sealed record UpdateUserPasswordCommand:IRequest<string>
    {
        public string OldPassword { get; init; }
        public string Password { get; init; }
    }
}
