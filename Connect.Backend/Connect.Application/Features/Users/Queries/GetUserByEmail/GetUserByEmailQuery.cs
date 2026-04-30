using Connect.Application.Commons.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Users.Queries.GetUserByEmail
{
    public sealed record GetUserByEmailQuery:IRequest<UserDto>
    {
        public string Email { get; init; }
    }
}
