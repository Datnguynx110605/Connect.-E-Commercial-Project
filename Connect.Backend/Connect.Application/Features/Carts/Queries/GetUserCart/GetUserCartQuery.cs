using Connect.Application.Commons.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Carts.Queries.GetUserCart
{
    public record GetUserCartQuery:IRequest<CartDto>
    {
    }
}
