using Connect.Application.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Categories.Commands.CreateCategory
{
    public sealed record CreateCategoryCommand:IRequest<CategoryDto>
    {
        public string CategoryName { get; init; }
    }
}
