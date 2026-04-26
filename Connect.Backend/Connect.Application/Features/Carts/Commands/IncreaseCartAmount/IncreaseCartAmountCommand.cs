using Connect.Application.Commons.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Carts.Commands.IncreaseCartAmount
{
    public sealed record IncreaseCartAmountCommand:IRequest<CartDto>
    {
        public int CartID { get; init; }
    }
}
