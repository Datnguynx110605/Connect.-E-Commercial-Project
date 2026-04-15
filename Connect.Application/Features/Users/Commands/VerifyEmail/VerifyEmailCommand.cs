using FluentResults;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Users.Commands.VerifyEmail
{
    public sealed record VerifyEmailCommand:IRequest<Result<VerifyEmailResponse>>
    {
        public string Token { get; }
    }
    public sealed record VerifyEmailResponse(string RegistrationSessionToken);
}
