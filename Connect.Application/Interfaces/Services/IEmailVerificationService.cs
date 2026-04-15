using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Interfaces.Services
{
    public interface IEmailVerificationService
    {
        string GenerateVerificationToken(string email);
        string GenerateRegistrationSessionToken(string email);
        string UnprotectToken(string token, string purpose);
    }
}
