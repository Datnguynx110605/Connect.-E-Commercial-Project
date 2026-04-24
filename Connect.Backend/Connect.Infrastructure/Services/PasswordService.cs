using Connect.Application.Interfaces.Services;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Infrastructure.Services
{
    public class PasswordService:IPasswordService
    {
        private const int WorkFactor = 12;

        public string Hash(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password, WorkFactor);
        }

        public bool Verify(string password, string hashedPassword)
        {
            return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
        }
    }
}
