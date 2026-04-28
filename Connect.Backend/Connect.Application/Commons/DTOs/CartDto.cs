using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Commons.DTOs
{
    public sealed record CartDto
    {
        public int CartID { get; init; }
        public int UserID { get; init; }
        public int ProductID { get; init; }
        public int CartQuantity { get; init; }
        public decimal CartUnitPrice { get; init; }
        public decimal CartTotalPrice { get; init; }
    }
}
