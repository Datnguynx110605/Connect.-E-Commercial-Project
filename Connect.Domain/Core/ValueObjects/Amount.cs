using Connect.Domain.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Domain.Core.ValueObjects
{
    public sealed record Amount
    {
        public int Value { get; }
        private Amount() { }
        private Amount(int value)
        {
            Value = value;
        }

        public static Amount Create(int value)
        {
            if (value < 0)
                throw new DomainExceptions(
                    message: "Amount is invalid",
                    code: "INVALID-AMOUNT",
                    metadata: new Dictionary<string, object>
                    {
                        { "AMOUNT", value }
                    });

            return new Amount(value);
        }

        public static Amount operator +(Amount a, Amount b)
        {
            return new Amount(a.Value + b.Value);
        }

        public static Amount operator -(Amount a, Amount b)
        {
            return new Amount(a.Value - b.Value);
        }

        public override string ToString()
        {
            return Value.ToString();
        }
    }
}
