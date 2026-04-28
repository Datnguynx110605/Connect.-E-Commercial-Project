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
    }
}
