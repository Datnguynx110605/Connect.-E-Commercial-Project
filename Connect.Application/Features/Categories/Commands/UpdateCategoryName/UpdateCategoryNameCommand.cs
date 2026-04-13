using Connect.Application.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Categories.Commands.UpdateCategoryName
{
    public sealed record UpdateCategoryNameCommand:IRequest<CategoryDto>
    {
        public int CategoryID { get; }
        public string CategoryName { get; init; }
    }
}
