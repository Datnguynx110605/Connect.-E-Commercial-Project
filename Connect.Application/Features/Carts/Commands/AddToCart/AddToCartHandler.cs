using Connect.Application.DTOs;
using Connect.Application.Interfaces.Persistences;
using Connect.Application.Interfaces.Services;
using Connect.Domain.Core.Entities;
using Connect.Domain.Core.ValueObjects;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Carts.Commands.AddToCart
{
    internal sealed class AddToCartHandler : IRequestHandler<AddToCartCommand, CartDto>
    {
        private readonly IUnitOfWork unitOfWork;
        private readonly ICurrentUserService currentUserService;
        public AddToCartHandler(IUnitOfWork _unitOfWork, ICurrentUserService _currentUserService)
        {
            unitOfWork = _unitOfWork;
            currentUserService = _currentUserService;
        }

        public async Task<CartDto> Handle(AddToCartCommand request, CancellationToken cancellationToken)
        {
            bool identity = await unitOfWork.Users.AnyAsync(x => x.UserID == currentUserService.UserID, cancellationToken);
            if (!identity)
                throw new Exception("User is not in the system");

            var product = await unitOfWork.Products.FirstOrDefaultAsync(x => x.ProductID == request.ProductID, cancellationToken);
            if (product == null)
                throw new Exception("Product not found");

            Amount quantity = Amount.Create(request.Quantity);

            Cart cart = Cart.CreateCart(currentUserService.UserID, product.ProductID, quantity, product.FinalPrice);

            await unitOfWork.Carts.AddAsync(cart, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);

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
