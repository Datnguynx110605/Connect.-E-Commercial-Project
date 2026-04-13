using Connect.Application.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Categories.Queries.GetSpecificCategory
{
    public sealed record GetSpecificCategoryCommand:IRequest<CategoryDto>
    {
        public int CategoryID { get; }
    }
}
