using Connect.Domain.Common;
using System;
using System.Collections.Generic;
using System.Text;
using System.Text.RegularExpressions;

namespace Connect.Domain.Core.ValueObjects
{
    public sealed record CategoryName
    {
        public string Value { get; }
        private CategoryName() { }
        private CategoryName(string value)
        {
            Value = value;
        }

        public static CategoryName Create(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new DomainExceptions(
                    message: "Category name must be required",
                    code: "REQUIRED-CATEGORYNAME",
                    metadata: new Dictionary<string, object>
                    {
                        { "CATEGORYNAME", value }
                    });

            if (value.Length < 2 || value.Length > 20)
                throw new DomainExceptions(
                    message: "Category name is invalid",
                    code: "INVALID-CATEGORYNAME",
                    metadata: new Dictionary<string, object>
                    {
                        { "CATEGORYNAME", value }   
                    });

            if (Regex.IsMatch(value, @"\W"))
                throw new DomainExceptions(
                     message: "Category name must not have special character",
                     code: "INVALID-CATEGORYNAME",
                     metadata: new Dictionary<string, object>
                     {
                        { "CATEGORYNAME", value }
                     });

            return new CategoryName(value.Trim());
        }

        public override string ToString()
        {
            return Value;
        }
    }
}
