using Connect.Application.Commons.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Products.Queries.GetProductByCategory
{
    public sealed record GetProductByCategoryQuery(int Page = DefaultPagination.Page, int PageSize = DefaultPagination.PageSize) :IRequest<PagedResult<ProductDto>>
    {
        public int CategoryID { get; init; }
    }
}
