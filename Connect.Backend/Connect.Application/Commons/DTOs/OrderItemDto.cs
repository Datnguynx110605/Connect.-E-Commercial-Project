using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Commons.DTOs
{
    public sealed record OrderItemDto
    {
        public int ProductID { get; init; }
        public decimal UnitPrice { get; init; }
        public int Quantity { get; init; }
    }
}
