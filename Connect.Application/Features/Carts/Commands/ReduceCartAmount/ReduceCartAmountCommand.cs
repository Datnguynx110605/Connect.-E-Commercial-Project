using Connect.Application.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Carts.Commands.ReduceCartAmount
{
    public sealed record ReduceCartAmountCommand:IRequest<CartDto>
    {
        public int CartID { get; }
        public int Quantity { get; init; }
    }
}
