using Connect.Application.Commons.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Products.Queries.GetProductByColor
{
    public sealed record GetProductByColorQuery(int Page = DefaultPagination.Page, int PageSize = DefaultPagination.PageSize) :IRequest<PagedResult<ProductDto>>
    {
        public string Color { get; init; }
    }
}
