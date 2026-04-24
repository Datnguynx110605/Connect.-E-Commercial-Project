using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Infrastructure.Settings
{
    public sealed class EmailSettings
    {
        public const string SectionName = "Email";
        public string Host { get; init; } = "smtp.gmail.com";
        public int Port { get; init; } = 587;
        public string Username { get; init; } = string.Empty;
        public string Password { get; init; } = string.Empty; 
        public string FromName { get; init; } = string.Empty;
    }
}
