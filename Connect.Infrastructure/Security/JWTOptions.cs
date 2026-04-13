using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Infrastructure.Security
{
    public class JWTOptions
    {
        public const string SectionName = "Jwt";
        public string SecretKey { get; init; }
        public string Issuer { get; init; }
        public string Audience { get; init; }
        public int ExpiryMinutes { get; init; }
    }
}
