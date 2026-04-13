using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Interfaces.Services
{
    public interface ICurrentUserService
    {
        int UserID { get; }
        string Role { get; }
    }
}
