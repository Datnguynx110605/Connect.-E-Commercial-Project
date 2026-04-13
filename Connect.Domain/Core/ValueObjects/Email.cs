using Connect.Domain.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Domain.Core.ValueObjects
{
    public sealed record Email
    {
        public string Value { get; }
        private Email() { }
        private Email(string value)
        {
            Value = value;
        }

        public static Email Create(string value)
        {
            if(string.IsNullOrWhiteSpace(value))
                throw new DomainExceptions(
                    message: "EMAIL must be required",
                    code: "REQUIRED-EMAIL",
                    metadata: new Dictionary<string, object>
                    {
                        { "EMAIL", value }
                    });

            if (!value.Contains("@"))
                throw new DomainExceptions(
                    message: "Email is invalid",
                    code: "INVALID-EMAIL",
                    metadata: new Dictionary<string, object>
                    {
                        { "EMAIL", value }
                    });

            return new Email(value.Trim());
        }

        public override string ToString()
        {
            return Value;
        }
    }
}
