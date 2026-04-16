using Connect.Domain.Common;
using System;
using System.Collections.Generic;
using System.Text;
using System.Text.RegularExpressions;

namespace Connect.Domain.Core.ValueObjects
{
    public sealed record ProductName
    {
        public string Value { get; }
        private ProductName() { }
        private ProductName(string value)
        {
            Value = value;
        }

        public static ProductName Create(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new DomainExceptions(
                    message: "Product name must be required",
                    code: "REQUIRED-PRODUCTNAME",
                    metadata: new Dictionary<string, object>
                    {
                        { "PRODUCTNAME", value }
                    });

            if (value.Length < 5 || value.Length > 100)
                throw new DomainExceptions(
                    message: "Product name is invalid",
                    code: "INVALID-PRODUCTNAME",
                    metadata: new Dictionary<string, object>
                    {
                        { "PRODUCTNAME", value }
                    });

            if (Regex.IsMatch(value, @"[^\p{L}\p{N}\s\-\|]"))
                throw new DomainExceptions(
                     message: "Product name must not have special character",
                     code: "INVALID-PRODUCTNAME",
                     metadata: new Dictionary<string, object>
                     {
                        { "PRODUCTNAME", value }
                     });


            return new ProductName(value.Trim());
        }

        public override string ToString()
        {
            return Value;
        }
    }
}
