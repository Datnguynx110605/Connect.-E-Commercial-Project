using Connect.Domain.Common;
using Connect.Domain.Core.Enums;
using Connect.Domain.Core.ValueObjects;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Domain.Events.OrderEvents
{
    public record OrderPlacedEvent:DomainEvent
    {
        public int UserID { get; }
        public int OrderID { get; }
        public Currency OrderTotalPrice { get; }
        public Amount OrderTotalItems { get; }
        public ShippingMethod OrderShippingMethod { get; }
        public PaymentMethod OrderPaymentMethod { get; }
        public OrderPlacedEvent(int userID, int orderID, Currency totalPrice, Amount totalItem, ShippingMethod method,PaymentMethod payMethod)
        {
            UserID = userID;
            OrderID = orderID;
            OrderTotalPrice = totalPrice;
            OrderTotalItems = totalItem;
            OrderShippingMethod = method;
            OrderPaymentMethod = payMethod;
        }
    }
}
