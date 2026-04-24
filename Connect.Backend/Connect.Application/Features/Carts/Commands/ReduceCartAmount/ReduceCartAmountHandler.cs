using Connect.Application.Commons.DTOs;
using Connect.Application.Interfaces.Persistences;
using Connect.Application.Interfaces.Services;
using Connect.Domain.Core.ValueObjects;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Carts.Commands.ReduceCartAmount
{
    internal sealed class ReduceCartAmountHandler : IRequestHandler<ReduceCartAmountCommand, CartDto>
    {
        private readonly IUnitOfWork unitOfWork;
        private readonly ICurrentUserService currentUserService;
        public ReduceCartAmountHandler(IUnitOfWork _unitOfWork, ICurrentUserService _currentUserService)
        {
            unitOfWork = _unitOfWork;
            currentUserService = _currentUserService;
        }

        public async Task<CartDto> Handle(ReduceCartAmountCommand request, CancellationToken cancellationToken)
        {
            bool identity = await unitOfWork.Users.AnyAsync(x => x.UserID == currentUserService.UserID, cancellationToken);
            if (!identity)
                throw new UnauthorizedAccessException("User is not in the system");

            var cart = await unitOfWork.Carts.GetByIdAsync(request.CartID, cancellationToken);
            if (cart == null)
                throw new Exception("Cart not found");

            if (currentUserService.UserID != cart.UserID)
                throw new UnauthorizedAccessException("No permission to access");

            cart.ReduceCartAmount(Amount.Create(request.Quantity));

            unitOfWork.Carts.Update(cart);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            return new CartDto
            {
                CartID = cart.CartID,
                UserID = cart.UserID,
                ProductID = cart.ProductID,
                CartQuantity = cart.CartQuantity.Value,
                CartUnitPrice = cart.CartUnitPrice.Value,
                CartTotalPrice = cart.CartTotalPrice.Value
            };
        }
    }
}
