using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Domain.Common
{
    public class DomainExceptions:Exception
    {
        public string Code { get; }
        public string Type { get; }
        public IReadOnlyDictionary<string, object>? Metadata { get; }

        public DomainExceptions(string code, string message, Dictionary<string, object>? metadata = null) : base(message)
        {
            Code = code;
            Metadata = metadata;
        }

    }
}
