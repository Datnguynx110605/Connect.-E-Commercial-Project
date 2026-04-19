using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Domain.Common
{
    public abstract record DomainEvent
    {
        public Guid EventID { get; } = Guid.NewGuid();
        public DateTime CreatedAt { get; } = DateTime.UtcNow;
    }
}
