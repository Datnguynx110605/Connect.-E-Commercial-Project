using Connect.Domain.Common;
using System;
using System.Collections.Generic;
using System.Text;
using System.Text.RegularExpressions;

namespace Connect.Domain.Core.ValueObjects
{
    public sealed record PhoneNumber
    {
        public string Value { get; }
        private PhoneNumber() { }
        private PhoneNumber(string value)
        {
            Value = value;
        }

        public static PhoneNumber Create(string value)
        {
            if(string.IsNullOrWhiteSpace(value))
                throw new DomainExceptions(
                    message: "Phone number must be required",
                    code: "REQUIRED-PHONENUMBER",
                    metadata: new Dictionary<string, object>
                    {
                        { "PHONENUMBER", value }
                    });

            if(value.Length < 10 || value.Length > 10)
                throw new DomainExceptions(
                    message: "Phone number is invalid",
                    code: "INVALID-PHONENUMBER",
                    metadata: new Dictionary<string, object>
                    {
                        { "PHONENUMBER", value }
                    });

            if(Regex.IsMatch(value, @"\W"))
                throw new DomainExceptions(
                    message: "Phone number is invalid",
                    code: "INVALID-PHONENUMBER",
                    metadata: new Dictionary<string, object>
                    {
                        { "PHONENUMBER", value }
                    });

            if(Regex.IsMatch(value, @"[a-z]"))
                throw new DomainExceptions(
                    message: "Phone number is invalid",
                    code: "INVALID-PHONENUMBER",
                    metadata: new Dictionary<string, object>
                    {
                        { "PHONENUMBER", value }
                    });

            return new PhoneNumber(value.Trim());
        }

        public override string ToString()
        {
            return Value;
        }
    }
}
