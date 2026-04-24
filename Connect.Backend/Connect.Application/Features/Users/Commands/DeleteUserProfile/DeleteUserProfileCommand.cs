using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Users.Commands.DeleteUserProfile
{
    public sealed record DeleteUserProfileCommand:IRequest<string>
    {
    }
}
