using Connect.Application.Commons.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Categories.Queries.GetAllCategories
{
    public sealed record GetAllCategoriesQuery:IRequest<IEnumerable<CategoryDto>>
    {
    }
}
