using Connect.Application.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Users.Commands.RegisterUser
{
    public sealed record RegisterUserCommand:IRequest<UserDto>
    {
        public int UserID { get;}
        public string RegistrationSessionToken { get; }
        public string UserName { get; init; }
        public string PhoneNumber { get; init; }
        public string Password { get; init; }
        public string Address { get; init; }
    }
    public sealed record RegisterUserResponse(string AccessToken, string RefreshToken);
}
