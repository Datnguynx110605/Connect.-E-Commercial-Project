using Connect.Application.Commons.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Users.Queries.GetUserByUserName
{
    public sealed record GetUserByUserNameQuery:IRequest<UserDto>
    {
        public string UserName { get; init; }
    }
}
