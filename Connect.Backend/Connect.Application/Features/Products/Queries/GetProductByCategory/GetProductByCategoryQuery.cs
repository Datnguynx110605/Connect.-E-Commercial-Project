using Connect.Application.Commons.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Products.Queries.GetProductByCategory
{
    public sealed record GetProductByCategoryQuery(int Page = 1, int PageSize = 10):IRequest<PagedResult<ProductDto>>
    {
        public int CategoryID { get; init; }
    }
}
