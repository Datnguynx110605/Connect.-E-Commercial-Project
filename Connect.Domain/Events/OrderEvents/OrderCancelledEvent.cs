using Connect.Domain.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Domain.Events.OrderEvents
{
    public record OrderCancelledEvent:DomainEvent
    {
        public int UserID { get; }
        public OrderCancelledEvent(int userID)
        {
            UserID = userID;
        }
    }
}
