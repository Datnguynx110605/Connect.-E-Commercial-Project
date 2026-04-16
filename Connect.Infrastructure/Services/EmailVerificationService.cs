using Connect.Application.Interfaces.Services;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Infrastructure.Services
{
    internal sealed class EmailVerificationService : IEmailVerificationService
    {
        private const string VerificationPurpose = "email-verification";
        private const string SessionPurpose = "registration-session";

        private readonly ITimeLimitedDataProtector verificationProtector;
        private readonly ITimeLimitedDataProtector sessionProtector;
        private readonly ILogger<EmailVerificationService> logger;
        public EmailVerificationService(IDataProtectionProvider provider, ILogger<EmailVerificationService> _logger)
        {
            verificationProtector = provider.CreateProtector(VerificationPurpose).ToTimeLimitedDataProtector();
            sessionProtector = provider.CreateProtector(SessionPurpose).ToTimeLimitedDataProtector();
            logger = _logger;
        }

        public string GenerateRegistrationSessionToken(string email)
        {
            var token = verificationProtector.Protect(email,lifetime: TimeSpan.FromMinutes(30));

            logger.LogInformation("Email registration session token generated for {Email}", email);

            return token;
        }

        public string GenerateVerificationToken(string email)
        {
            var token = sessionProtector.Protect(email,lifetime: TimeSpan.FromMinutes(15));

            logger.LogInformation("Email verification token generated for {Email}", email);

            return token;
        }

        public string UnprotectToken(string token, string purpose)
        {
            var protector = purpose switch
            {
                VerificationPurpose => verificationProtector,
                SessionPurpose => sessionProtector,
                _ => throw new ArgumentException($"Unknown purpose: {purpose}")
            };

            return protector.Unprotect(token, out _);
        }
    }
}
