using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Products.Commands.DeleteProduct
{
    public sealed record DeleteProductCommand:IRequest<string>
    {
        public int ProductID { get; }
    }
}
