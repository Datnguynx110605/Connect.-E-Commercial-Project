using Connect.Application.DTOs;
using Connect.Domain.Core.Entities;
using Connect.Domain.Core.Enums;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Orders.Commands.CreateOrder
{
    public sealed record CreateOrderCommand:IRequest<OrderDto>
    {
        public int ProductID { get; }
        public decimal UnitPrice { get; }
        public int Quantity { get; init; }
        public int? CouponID { get; init; }
        public ShippingMethod OrderShippingMethod { get; init; }
        public PaymentMethod OrderPaymentMethod { get; init; }
        public List<OrderItemDto> items { get; init; } = new();
    }
}
