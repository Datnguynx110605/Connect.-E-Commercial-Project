using FluentResults;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Users.Queries.GetSignInWithURL
{
    public sealed record GetSignInWithURLQuery:IRequest<string>
    {
    }
}
