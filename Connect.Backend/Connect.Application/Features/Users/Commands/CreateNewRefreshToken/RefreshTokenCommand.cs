using Connect.Application.Commons.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Users.Commands.CreateNewRefreshToken
{
    public sealed record RefreshTokenCommand:IRequest<RefreshTokenDto>
    {
        public int UserID { get; init; }
        public string RefreshToken { get; init; }
    }
}
