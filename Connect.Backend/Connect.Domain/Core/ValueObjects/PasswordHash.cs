using Connect.Domain.Common;
using System;
using System.Collections.Generic;
using System.Text;
using System.Text.RegularExpressions;

namespace Connect.Domain.Core.ValueObjects
{
    public sealed record PasswordHash
    {
        public string Value { get; }
        private PasswordHash() { }
        private PasswordHash(string value)
        {
            Value = value;
        }

        public static PasswordHash Create(string value)
        {
            if(string.IsNullOrWhiteSpace(value))
                throw new DomainExceptions(
                    message: "PasswordHash must be required",
                    code: "REQUIRED-PASSWORDHASH",
                    metadata: new Dictionary<string, object>
                    {
                        { "PASSWORDHASH", value }
                    });

            if (value.Length != 60)
                throw new DomainExceptions(
                    message: "PasswordHash is invalid",
                    code: "INVALID-PASSWORDHASH",
                    metadata: new Dictionary<string, object>
                    {
                        { "PASSWORDHASH", value }
                    });

            if(!Regex.IsMatch(value, @"^\$2[aby]\$\d{2}\$"))
                throw new DomainExceptions(
                    message: "PasswordHash is invalid",
                    code: "INVALID-PASSWORDHASH",
                    metadata: new Dictionary<string, object>
                    {
                        { "PASSWORDHASH", value }
                    });

            return new PasswordHash(value.Trim());
        }

        public override string ToString()
        {
            return Value;
        }
    }
}
