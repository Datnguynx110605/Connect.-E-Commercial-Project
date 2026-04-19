using Connect.Domain.Common;
using Connect.Domain.Core.ValueObjects;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Domain.Core.Entities
{
    public sealed class Payment
    {
        public int PaymentID { get; private set; }
        public int OrderID { get; private set; }
        public string PaymentGatewayID { get; private set; }
        public Currency TotalAmount { get; private set; }
        public bool IsPaidSuccess { get; private set; }
        public string? ErrorCode { get; private set; }
        public DateTime PaidAt { get; private set; }
        private Payment() { }
        private Payment(int orderID, string paymentGatewayID, Currency totalAmount, bool isSuccess, string? errorCode)
        {
            OrderID = orderID;
            PaymentGatewayID = paymentGatewayID;
            TotalAmount = totalAmount;
            IsPaidSuccess = isSuccess;
            ErrorCode = errorCode;
            PaidAt = DateTime.UtcNow;
        }

        public static Payment CreatePayment(int orderID, string paymentGatewayID, Currency totalAmount, bool isSuccess, string? errorCode)
        {
            if (orderID <= 0)
                throw new DomainExceptions(
                    message: "OrderID is invalid",
                    code: "INVALID-ORDERID",
                    metadata: new Dictionary<string, object>
                    {
                        { "ORDERID", orderID }
                    });

            return new Payment(orderID, paymentGatewayID, totalAmount, isSuccess, errorCode);
        }

    }
}
