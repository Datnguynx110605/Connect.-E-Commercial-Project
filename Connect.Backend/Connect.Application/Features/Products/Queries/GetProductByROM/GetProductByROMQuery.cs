using Connect.Application.Commons.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Products.Queries.GetProductByROM
{
    public sealed record GetProductByROMQuery:IRequest<ProductDto>
    {
        public int Rom { get; init; }
    }
}
