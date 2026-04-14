using Connect.Domain.Common;
using Connect.Domain.Core.Enums;
using Connect.Domain.Core.ValueObjects;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Domain.Events.OrderEvents
{
    public record OrderPaidEvent:DomainEvent
    {
        public int OrderID { get; }
        public int UserID { get; }
        public PaymentMethod OrderPaymentMethod { get; }
        public Currency TotalAmount { get; }
        public OrderPaidEvent(int orderID, int userID, PaymentMethod method, Currency amount)
        {
            OrderID = orderID;
            UserID = userID;
            OrderPaymentMethod = method;
            TotalAmount = amount;
        }
    }
}
