using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.DTOs
{
    public record CouponDto
    {
        public string CouponCode { get; init; }
        public decimal DiscountAmount { get; init; }
        public int CouponQuantity { get; init; }
        public DateTime ExpiryDate { get; init; }
    }
}
