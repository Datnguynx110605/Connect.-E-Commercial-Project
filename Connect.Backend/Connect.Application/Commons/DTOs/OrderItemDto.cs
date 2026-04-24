using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Commons.DTOs
{
    public record OrderItemDto
    {
        public int ProductID { get; init; }
        public decimal UnitPrice { get; init; }
        public int Quantity { get; init; }
    }
}
