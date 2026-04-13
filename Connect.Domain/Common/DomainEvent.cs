using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Domain.Common
{
    public abstract record DomainEvent
    {
        public int EventID { get; } = new int();
        public DateTime CreatedAt { get; } = DateTime.UtcNow;
    }
}
