using Connect.Domain.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Domain.Core.ValueObjects
{
    public sealed record Currency
    {
        public decimal Value { get; }
        private Currency() { }
        private Currency(decimal value)
        {
            Value = value;
        }

        public static Currency Create(decimal value)
        {
            if (value < 0)
                throw new DomainExceptions(
                    message: "Currency is invalid",
                    code: "INVALID-CURRENCY",
                    metadata: new Dictionary<string, object>
                    {
                        { "CURRENCY", value }
                    });

            return new Currency(value);
        }

       public static Currency operator +(Currency a, Currency b)
       {
            return new Currency(a.Value + b.Value);
       }

        public static Currency operator -(Currency a, Currency b)
        {
            return new Currency(a.Value - b.Value);
        }

        public static Currency operator*(Currency a, Amount b)
        {
            return new Currency(a.Value * b.Value);
        }

        public static Currency operator *(Currency a, decimal b)
        {
            return new Currency(Math.Round(a.Value * b, 0));
        }

        public override string ToString() => Value.ToString("N0") + " VND";
    }
}
