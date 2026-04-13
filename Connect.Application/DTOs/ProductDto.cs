using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.DTOs
{
    public record ProductDto
    {
        public string ProductName { get; init; }
        public string Description { get; init; }
        public decimal OriginalPrice { get; init; }
        public decimal FinalPrice { get; init; }
        public int Stock { get; init; }
        public int Ram { get; init; }
        public int Rom { get; init; }
        public string Color { get; init; }
        public List<string> ImageURL { get; init; }
        public string ProductStatus { get; init; }
        public DateTime CreatedAt { get; init; }
    }
}
