using Connect.Application.DTOs;
using Connect.Application.Interfaces.Persistences;
using Connect.Application.Interfaces.Services;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Carts.Queries.GetUserCart
{
    public class GetUserCartHandler : IRequestHandler<GetUserCartQuery, CartDto>
    {
        private readonly IUnitOfWork unitOfWork;
        private readonly ICurrentUserService currentUserService;
        public GetUserCartHandler(IUnitOfWork _unitOfWork, ICurrentUserService _currentUserService)
        {
            unitOfWork = _unitOfWork;
            currentUserService = _currentUserService;
        }

        public async Task<CartDto> Handle(GetUserCartQuery request, CancellationToken cancellationToken)
        {
            bool identity = await unitOfWork.Users.AnyAsync(x => x.UserID == currentUserService.UserID, cancellationToken);
            if (!identity)
                throw new UnauthorizedAccessException("User is not in the system");

            var cart = await unitOfWork.Carts.GetByIdAsync(currentUserService.UserID, cancellationToken);
            if (cart == null)
                throw new Exception("Cart not found");

            return new CartDto
            {
                UserID = cart.UserID,
                ProductID = cart.ProductID,
                CartQuantity = cart.CartQuantity.Value,
                CartUnitPrice = cart.CartUnitPrice.Value,
                CartTotalPrice = cart.CartTotalPrice.Value
            };
        }
    }
}
