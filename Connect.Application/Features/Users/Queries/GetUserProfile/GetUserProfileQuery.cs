using Connect.Application.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Users.Queries.GetUserProfile
{
    public sealed record GetUserProfileQuery:IRequest<UserDto>
    {
    }
}
