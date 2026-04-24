using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Domain.Common
{
    public abstract class AggregateRoot
    {
        private readonly List<DomainEvent> domainEvents = new();
        public IReadOnlyCollection<DomainEvent> DomainEvents => domainEvents.AsReadOnly();
        protected void RaiseDomainEvent(DomainEvent domainEvent) => domainEvents.Add(domainEvent);
        public void ClearDomainEvents() => domainEvents.Clear();
    }
}
