using Connect.Application.Commons.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Users.Queries.GetAllUsers
{
    public sealed record GetAllUsersQuery:IRequest<IEnumerable<UserDto>>
    {
    }
}
