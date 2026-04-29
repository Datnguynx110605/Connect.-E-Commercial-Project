using Connect.Application.Commons.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Products.Queries.GetProductByROM
{
    public sealed record GetProductByROMQuery(int Page = 1, int PageSize = 10):IRequest<PagedResult<ProductDto>>
    {
        public int Rom { get; init; }
    }
}
