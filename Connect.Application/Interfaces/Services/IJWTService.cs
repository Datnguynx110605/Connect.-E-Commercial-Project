using Connect.Domain.Core.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Interfaces.Services
{
    public interface IJWTService
    {
        string GenerateAccessToken(User user);
    }
}
