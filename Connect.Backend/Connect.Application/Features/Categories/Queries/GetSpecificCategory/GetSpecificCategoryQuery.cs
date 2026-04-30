using Connect.Application.Commons.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Categories.Queries.GetSpecificCategory
{
    public sealed record GetSpecificCategoryQuery:IRequest<CategoryDto>
    {
        public int CategoryID { get; init; }
    }
}
