using Connect.Domain.Common;
using System;
using System.Collections.Generic;
using System.Text;
using System.Text.RegularExpressions;

namespace Connect.Domain.Core.ValueObjects
{
    public sealed record UserName
    {
        public string Value { get; }
        private UserName() { }
        private UserName(string value)
        {
            Value = value;
        }

        public static UserName Create(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new DomainExceptions(
                    message: "User name must be required",
                    code: "REQUIRED-USERNAME",
                    metadata: new Dictionary<string, object> 
                    {
                        { "USERNAME", value }
                    });

            if(value.Length < 3 || value.Length > 30)
                throw new DomainExceptions(
                    message: "User name is invalid",
                    code: "INVALID-USERNAME",
                    metadata: new Dictionary<string, object>
                    {
                        { "USERNAME", value }
                    });

            if (string.IsNullOrWhiteSpace(value))
                throw new DomainExceptions(
                    message: "User name must be required",
                    code: "REQUIRED-USERNAME",
                    metadata: new Dictionary<string, object> 
                    {
                        { "USERNAME", value }
                    });

            if (!Regex.IsMatch(value, @"^[a-z]+$"))
                throw new DomainExceptions(
                    message: "User name must only contain lowercase letters",
                    code: "INVALID-USERNAME",
                    metadata: new Dictionary<string, object>
                    {
                        { "USERNAME", value }
                    });

            return new UserName(value.Trim());
        }

        public override string ToString()
        {
            return Value;
        }
    }
}
