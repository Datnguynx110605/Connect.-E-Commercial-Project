using Connect.Domain.Common;
using Connect.Domain.Core.Entities;
using Connect.Domain.Core.Enums;
using Connect.Domain.Core.ValueObjects;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Domain.Events.OrderEvents
{
    public record OrderPlacedEvent:DomainEvent
    {
        public Order Order { get; }
        public OrderPlacedEvent(Order order)
        {
            Order = order;
        }
    }
}
