using Connect.Application.Commons.DTOs;
using FluentResults;
using MediatR;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Users.Commands.ProcessOAuthCallback
{
    public sealed record ProcessOAuthCallbackCommand:IRequest<RefreshTokenDto>
    {
        public HttpRequest HttpRequest { get; init; } = null!;
        public string UserName { get; init; }
        public string Email { get; init; }
        public string? PhoneNumber { get; init; }
        public string? Address { get; init; }
        public string? Password { get; init; }
    }
}
