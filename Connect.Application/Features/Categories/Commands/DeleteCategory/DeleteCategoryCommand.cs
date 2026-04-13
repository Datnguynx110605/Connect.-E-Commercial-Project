using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Categories.Commands.DeleteCategory
{
    public sealed record DeleteCategoryCommand:IRequest<string>
    {
        public int CategoryID { get; }
    }
}
