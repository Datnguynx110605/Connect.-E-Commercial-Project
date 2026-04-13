using Connect.Application.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Products.Commands.UpdateProductImage
{
    public sealed record UpdateProductImageCommand:IRequest<ProductDto>
    {
        public int ProductID { get; }
        public List<string> ImageURL { get; init; }
    }
}
