using Connect.Application.Commons.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Products.Queries.GetProductByPriceRange
{
    public sealed record GetProductByPriceRangeQuery:IRequest<IEnumerable<ProductDto>>
    {
        public decimal FromPrice { get; init; }
        public decimal ToPrice { get; init; }
    }
}
