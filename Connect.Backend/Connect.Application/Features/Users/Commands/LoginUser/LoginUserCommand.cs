using Connect.Application.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Users.Commands.LoginUser
{
    public sealed record LoginUserCommand:IRequest<RefreshTokenDto>
    {
        public string Email { get; init; }
        public string Password { get; init; }
    }
}
