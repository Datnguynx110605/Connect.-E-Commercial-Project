using FluentResults;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Users.Commands.CheckEmail
{
    public sealed record CheckEmailCommand:IRequest<Result>
    {
        public string Email { get; init; }
    }
}
