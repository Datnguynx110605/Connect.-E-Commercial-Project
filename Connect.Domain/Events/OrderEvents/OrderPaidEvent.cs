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
        public PaymentMethod OrderPaymentMethod { get; }
        public Currency TotalAmount { get; }
        public OrderPaidEvent(PaymentMethod method, Currency amount)
        {
            OrderPaymentMethod = method;
            TotalAmount = amount;
        }
    }
}
