using Connect.Application.Commons.DTOs;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Carts.Commands.RemoveCart
{
    public sealed record RemoveCartCommand:IRequest<string>
    {
        public int CartID { get; init; }
    }
}
