using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.DTOs
{
    public sealed record PaymentDto
    {
        public int OrderID { get; init; }
        public string PaymentGatewayID { get; init; }
        public bool IsPaidSuccess { get; init; }
        public string? ErrorCode { get; init; }
    }
}
