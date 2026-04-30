using Connect.Application.Commons.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Categories.Queries.GetAllCategories
{
    public sealed record GetAllCategoriesQuery(int Page = DefaultPagination.Page, int PageSize = DefaultPagination.PageSize) : IRequest<PagedResult<CategoryDto>>
    {
    }
}
