using Connect.Application.Commons.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Categories.Commands.UpdateCategoryName
{
    public sealed record UpdateCategoryNameCommand:IRequest<CategoryDto>
    {
        public int CategoryID { get; init; }
        public string CategoryName { get; init; }
    }
}
