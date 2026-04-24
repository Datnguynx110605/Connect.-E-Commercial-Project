using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Commons.DTOs
{
    public sealed record PaymentDto
    {
        public long PaymentID { get; init; }
        public int OrderID { get; init; }
        public string PaymentType { get; init; }
        public long TransactionID { get; init; }
        public string BankingInfo { get; init; }
        public decimal TotalAmount { get; init; }
        public bool IsPaidSuccess { get; init; }
        public DateTime PaidAt { get; init; }
    }
}
