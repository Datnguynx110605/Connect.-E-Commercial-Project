using Connect.Domain.Common;
using Connect.Domain.Core.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Domain.Events.OrderEvents
{
    public record OrderCompletedEvent:DomainEvent
    {
        public int OrderID { get; }
        public int UserID { get; }
        public OrderStatus OrderStatus { get; }
        public OrderCompletedEvent(int orderID, int userID, OrderStatus status)
        {
            OrderID = orderID;
            UserID = userID;
            OrderStatus = status;
        }
    }
}
