using Connect.Application.Commons.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Carts.Queries.GetAllCarts
{
    public sealed record GetAllCartsQuery:IRequest<IEnumerable<CartDto>>
    {
    }
}
