using Connect.Application.DTOs;
using Connect.Application.Features.Coupons.Commands.UpdateCouponQuantity;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Carts.Commands.AddToCart
{
    public sealed record AddToCartCommand:IRequest<CartDto>
    {
        public int UserID { get; }
        public int ProductID { get; init; }
        public int Quantity { get; init; }
    }
}
