using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Commons.DTOs
{
    public record CouponDto
    {
        public int CouponID { get; init; }
        public string CouponCode { get; init; }
        public decimal DiscountAmount { get; init; }
        public int CouponQuantity { get; init; }
        public DateTime ExpiryDate { get; init; }
    }
}
