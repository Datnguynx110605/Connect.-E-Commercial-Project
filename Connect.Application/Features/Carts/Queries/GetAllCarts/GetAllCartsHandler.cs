using Connect.Application.DTOs;
using Connect.Application.Interfaces.Persistences;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Carts.Queries.GetAllCarts
{
    internal sealed class GetAllCartsHandler : IRequestHandler<GetAllCartsQuery, IEnumerable<CartDto>>
    {
        private readonly IUnitOfWork unitOfWork;
        public GetAllCartsHandler(IUnitOfWork _unitOfWork)
        {
            unitOfWork = _unitOfWork;
        }

        public async Task<IEnumerable<CartDto>> Handle(GetAllCartsQuery request, CancellationToken cancellationToken)
        {
            var cart = await unitOfWork.Carts.GetAllNoTrackingAsync(cancellationToken);
            if (cart == null)
                throw new Exception("Cart not found");

            return cart.Select(x => new CartDto
            {
                UserID = x.UserID,
                ProductID = x.ProductID,
                CartQuantity = x.CartQuantity.Value,
                CartUnitPrice = x.CartUnitPrice.Value,
                CartTotalPrice = x.CartTotalPrice.Value
            });
        }
    }
}
