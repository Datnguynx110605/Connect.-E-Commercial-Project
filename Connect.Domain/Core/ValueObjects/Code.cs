using Connect.Domain.Common;
using System;
using System.Collections.Generic;
using System.Text;
using System.Text.RegularExpressions;

namespace Connect.Domain.Core.ValueObjects
{
    public sealed record Code
    {
        public string Value { get; }
        private Code() { }
        private Code(string value)
        {
            Value = value;
        }

        public static Code Create(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new DomainExceptions(
                    message: "Code must be required",
                    code: "REQUIRED-CODE",
                    metadata: new Dictionary<string, object>
                    {
                        { "Code", value } 
                    });

            if(value.Length < 5 || value.Length > 12)
                throw new DomainExceptions(
                    message: "Code is invalid",
                    code: "INVALID-CODE",
                    metadata: new Dictionary<string, object>
                    {
                        { "Code", value }
                    });

            if (Regex.IsMatch(value, @"\d"))
                throw new DomainExceptions(
                   message: "Code must have number",
                   code: "INVALID-CODE",
                   metadata: new Dictionary<string, object>
                   {
                        { "Code", value }
                   });

            return new Code(value.Trim());
        }

        public override string ToString()
        {
            return Value;
        }
    }
}
