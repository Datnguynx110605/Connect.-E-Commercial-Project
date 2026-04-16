using Connect.Application.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Products.Commands.UpdateProductStock
{
    public sealed record UpdateProductStockCommand:IRequest<ProductDto>
    {
        public int ProductID { get; init; }
        public int Stock { get; init; }
    }
}
