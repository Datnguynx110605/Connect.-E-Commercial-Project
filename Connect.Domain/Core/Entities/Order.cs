using Connect.Domain.Common;
using Connect.Domain.Core.Enums;
using Connect.Domain.Core.ValueObjects;
using Connect.Domain.Events.OrderEvents;
using System;
using System.Collections.Generic;
using System.ComponentModel.Design;
using System.Runtime.InteropServices;
using System.Text;

namespace Connect.Domain.Core.Entities
{
    public class Order:AggregateRoot
    {
        public int OrderID { get; private set; }
        public int UserID { get; private set; }
        public int? CouponID { get; private set; }
        public Currency OrderTotalPrice { get; private set; }
        public Amount OrderTotalItems { get; private set; }
        public ShippingMethod OrderShippingMethod { get; private set; }
        public PaymentMethod OrderPaymentMethod { get; private set; }
        public PaymentStatus OrderPaymentStatus { get; private set; }
        public OrderStatus OrderStatus { get; private set; }
        private readonly List<OrderItem> items = new();
        public IReadOnlyCollection<OrderItem> OrderItems => items.AsReadOnly();
        public DateTime CreatedAt { get; private set; }
        private Order() { }
        private Order(int userID, int couponID, ShippingMethod shipMethod, PaymentMethod payMethod, IEnumerable<OrderItem> orderItems)
        {
            UserID = userID;
            CouponID = couponID;
            items.AddRange(orderItems);
            OrderTotalItems = Amount.Create(orderItems.Count());
            OrderShippingMethod = shipMethod;
            OrderPaymentMethod = payMethod;
            IntitalizePaymentStatus();
            OrderStatus = OrderStatus.Pending;
            CreatedAt = DateTime.UtcNow;
        }

        public static Order CreateOrder(int userID,int couponID, ShippingMethod shipMethod, PaymentMethod payMethod, IEnumerable<OrderItem> orderItems, Currency discountAmount)
        {
            if (userID <= 0)
                throw new DomainExceptions(
                    message: "User id is invalid",
                    code: "INVALID-USERID",
                    metadata: new Dictionary<string, object>
                    {
                        { "USERID", userID }
                    });

            if (!Enum.IsDefined(typeof(ShippingMethod), shipMethod))
                throw new DomainExceptions(
                    message:"Shipping method is invalid",
                    code:"INVALID-SHIPPINGMETHOD");

            if (!Enum.IsDefined(typeof(PaymentMethod), payMethod))
                throw new DomainExceptions(
                    message:"Payment method is invalid",
                    code:"INVALID-PAYMENTMETHOD");

            if(!orderItems.Any())
                throw new DomainExceptions( 
                    message:"Order item is required",
                    code: "REQUIRED-ORDERITEM");

            var order = new Order(userID,couponID, shipMethod, payMethod, orderItems);

            order.CalculateTotalPrice(discountAmount);

            order.RaiseDomainEvent(new OrderPlacedEvent(order));

            return order;
        }

        private void CalculateTotalPrice(Currency discountAmount)
        {
            OrderTotalPrice = items.Select(x => x.OrderItemTotalPrice).Aggregate(Currency.Create(0), (sum, next) => sum + next);

            OrderTotalPrice -= discountAmount;

            if (OrderShippingMethod == ShippingMethod.Standard)
            {
                Currency shippingFee = Currency.Create(30000);
                OrderTotalPrice += shippingFee;
            }
            if(OrderShippingMethod == ShippingMethod.Fast)
            {
                Currency shippingFee = Currency.Create(50000);
                OrderTotalPrice += shippingFee;
            }
            else if (OrderShippingMethod == ShippingMethod.SuperFast)
            {
                Currency shippingFee = Currency.Create(80000);
                OrderTotalPrice += shippingFee;
            }
        }

        public void CancelOrder()
        {
            if (OrderStatus != OrderStatus.Pending)
                throw new DomainExceptions(
                    message: "Order is already shipped",
                    code: "UNABLE-CANCELORDER",
                    metadata: new Dictionary<string, object>
                    { 
                        { "ORDERSTATUS", OrderStatus}
                    });

            OrderStatus = OrderStatus.Cancelled;

            RaiseDomainEvent(new OrderCancelledEvent(this));
        }

        private void IntitalizePaymentStatus()
        {
            if (OrderPaymentMethod == PaymentMethod.Cash)
            {
                OrderPaymentStatus = PaymentStatus.Unpaid;
            }
            else OrderPaymentStatus = PaymentStatus.Pending;
        }

        public void MarkOrderStatusToCompleted()
        {
            if (OrderPaymentStatus == PaymentStatus.Unpaid || OrderStatus == OrderStatus.Cancelled)
                throw new DomainExceptions(
                    message: "Order is unpaid or cancelled",
                    code: "INVALID-STATUS",
                    metadata: new Dictionary<string, object>
                    {
                        { "ORDERPAYMENTSTATUS", OrderPaymentStatus}
                    });

            OrderStatus = OrderStatus.Completed;
        }

        public void MarkOrderStatusToShipping()
        {
            if(OrderStatus == OrderStatus.Cancelled)
                throw new DomainExceptions(
                    message: "Order is cancelled",
                    code: "INVALID-STATUS",
                    metadata: new Dictionary<string, object>
                    {
                        { "ORDERSTATUS", OrderStatus}
                    });

            OrderStatus = OrderStatus.Shipping;
        }

        public void MarkAsPaid()
        {
            if (OrderPaymentStatus == PaymentStatus.Paid)
                throw new DomainExceptions(
                    message: "Order is already paid",
                    code: "PAID-ORDER",
                    metadata: new Dictionary<string, object>
                    {
                        { "ORDERPAYMENTSTATUS", OrderPaymentStatus}
                    });

            if (OrderStatus == OrderStatus.Cancelled)
                throw new DomainExceptions(
                    message: "Order is already cancelled",
                    code: "CANCELLED-ORDER",
                    metadata: new Dictionary<string, object>
                    {
                        { "ORDERSTATUS", OrderStatus}
                    });

            OrderPaymentStatus = PaymentStatus.Paid;
        }

        public void MarkAsPaidForPaymentGateway(bool isSuccess)
        {
            if (!isSuccess)
                throw new DomainExceptions(
                    message: "Order has not been paid or paid failed",
                    code: "FAILED-PAID",
                    metadata: new Dictionary<string, object>
                    {
                        { "PAYMENTSTATUS", isSuccess }
                    });

            if (OrderPaymentStatus == PaymentStatus.Paid)
                throw new DomainExceptions(
                    message: "Order is already paid",
                    code: "PAID-ORDER",
                    metadata: new Dictionary<string, object>
                    {
                        { "ORDERPAYMENTSTATUS", OrderPaymentStatus}
                    });

            if (OrderStatus == OrderStatus.Cancelled)
                throw new DomainExceptions(
                    message: "Order is already cancelled",
                    code: "CANCELLED-ORDER",
                    metadata: new Dictionary<string, object>
                    {
                        { "ORDERSTATUS", OrderStatus}
                    });

            OrderPaymentStatus = PaymentStatus.Paid;

            RaiseDomainEvent(new OrderPaidEvent(this));
        }
    }
}
