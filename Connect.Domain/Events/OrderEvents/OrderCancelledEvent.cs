using Connect.Domain.Common;
using Connect.Domain.Core.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Domain.Events.OrderEvents
{
    public record OrderCancelledEvent:DomainEvent
    {
        public Order Order { get; }
        public OrderCancelledEvent(Order order)
        {
            Order = order;
        }
    }
}
