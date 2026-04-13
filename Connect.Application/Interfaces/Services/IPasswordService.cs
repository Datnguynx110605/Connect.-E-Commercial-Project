using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Interfaces.Services
{
    public interface IPasswordService
    {
        string Hash(string password);
        bool Verify(string password, string hashedPassword);
    }
}
