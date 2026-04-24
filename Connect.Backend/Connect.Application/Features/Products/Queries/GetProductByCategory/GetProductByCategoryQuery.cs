using Connect.Application.Commons.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Products.Queries.GetProductByCategory
{
    public sealed record GetProductByCategoryQuery:IRequest<ProductDto>
    {
        public int CategoryID { get; init; }
    }
}
