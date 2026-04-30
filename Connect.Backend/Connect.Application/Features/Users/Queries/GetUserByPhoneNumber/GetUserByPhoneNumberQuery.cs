using Connect.Application.Commons.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Users.Queries.GetUserByPhoneNumber
{
    public sealed record GetUserByPhoneNumberQuery : IRequest<UserDto>
    {
        public string PhoneNumber { get; init; }
    }
}
