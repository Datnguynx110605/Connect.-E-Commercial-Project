using Connect.Domain.Core.Entities;
using Connect.Domain.Core.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Commons.DTOs
{
    public sealed record OrderDto
    {
        public int OrderID { get; init; }
        public int UserID { get; init; }
        public int? CouponID { get; init; }
        public int OrderTotalItems { get; init; }
        public decimal OrderTotalItemPrice { get; init; }
        public decimal OrderFinalPrice { get; init; }
        public string OrderShippingMethod { get; init; }
        public string OrderPaymentMethod { get; init; }
        public string OrderPaymentStatus { get; init; }
        public string OrderStatus { get; init; }
        public List<OrderItemDto> OrderItems { get; init; } = new();
        public DateTime CreatedAt { get; init; }
    }
}
