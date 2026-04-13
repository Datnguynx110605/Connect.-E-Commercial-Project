using Connect.Application.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Products.Commands.CreateProduct
{
    public sealed record CreateProductCommand:IRequest<ProductDto>
    {
        public int CategoryID { get; init; }
        public string ProductName { get; init; }
        public string Description { get; init; }
        public decimal OriginalPrice { get; init; }
        public decimal FinalPrice { get; init; }
        public int Stock { get; init; }
        public int Ram { get; init; }
        public int Rom { get; init; }
        public string Color { get; init; }
        public string ProductStatus { get; init; }
        public List<string> ImageURL { get; init; }
    }
}
