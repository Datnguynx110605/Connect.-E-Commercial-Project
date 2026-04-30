using Connect.Application.Commons.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Products.Queries.GetAllProducts
{
    public sealed record GetAllProductsQuery(int Page = DefaultPagination.Page, int PageSize = DefaultPagination.PageSize) : IRequest<PagedResult<ProductDto>>
    {
    }
}
