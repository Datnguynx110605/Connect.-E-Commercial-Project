using Connect.Application.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Users.Commands.UpdateUserProfile
{
    public sealed record UpdateUserProfileCommand:IRequest<UserDto>
    {
        public string UserName { get; init; }
        public string Email { get; init; }
        public string PhoneNumber { get; init; }
        public string Address { get; init; }
    }
}
