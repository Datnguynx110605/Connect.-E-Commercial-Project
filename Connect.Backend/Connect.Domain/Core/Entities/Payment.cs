using Connect.Domain.Common;
using Connect.Domain.Core.ValueObjects;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Domain.Core.Entities
{
    public sealed class Payment
    {
        public long PaymentID { get; private set; }
        public int OrderID { get; private set; }
        public string PaymentType { get; private set; }
        public long TransactionID { get; private set; }
        public string BankingInfo { get; private set; }
        public Currency TotalAmount { get; private set; }
        public bool IsPaidSuccess { get; private set; }
        public DateTime PaidAt { get; private set; }
        private Payment() { }
        private Payment(long paymentID, int orderID, string paymentType, long transactionID,string bankingInfo, Currency totalAmount, bool isSuccess, DateTime paidAt)
        {
            PaymentID = paymentID;
            OrderID = orderID;
            PaymentType = paymentType;
            TransactionID = transactionID;
            BankingInfo = bankingInfo;
            TotalAmount = totalAmount;
            IsPaidSuccess = isSuccess;
            PaidAt = paidAt;
        }

        public static Payment CreatePayment(long paymentID, int orderID, string paymentType, long transactionID, string bankingInfo, Currency totalAmount, bool isSuccess, DateTime paidAt)
        {
            if (orderID <= 0)
                throw new DomainExceptions(
                    message: "OrderID is invalid",
                    code: "INVALID-ORDERID",
                    metadata: new Dictionary<string, object>
                    {
                        { "ORDERID", orderID }
                    });

            if(paymentID.ToString().Length <= 0)
                throw new DomainExceptions(
                    message: "PaymentID is required",
                    code: "REQUIRED-PAYMENTID",
                    metadata: new Dictionary<string, object>
                    {
                        { "PAYMENTID", paymentID }
                    });

            return new Payment(paymentID, orderID, paymentType, transactionID, bankingInfo, totalAmount, isSuccess, paidAt);
        }

    }
}
