using Connect.Application.Interfaces.Persistences;
using Connect.Application.Interfaces.Services;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Carts.Commands.RemoveCart
{
    internal sealed class RemoveCartHandler : IRequestHandler<RemoveCartCommand, string>
    {
        private readonly IUnitOfWork unitOfWork;
        private readonly ICurrentUserService currentUserService;
        public RemoveCartHandler(IUnitOfWork _unitOfWork, ICurrentUserService _currenUserService)
        {
            unitOfWork = _unitOfWork;
            currentUserService = _currenUserService;
        }

        public async Task<string> Handle(RemoveCartCommand request, CancellationToken cancellationToken)
        {
            bool identity = await unitOfWork.Users.AnyAsync(x => x.UserID == currentUserService.UserID, cancellationToken);
            if (!identity)
                throw new UnauthorizedAccessException("User is not in the system");

            var cart = await unitOfWork.Carts.GetByIdAsync(request.CartID, cancellationToken);
            if (cart == null)
                throw new Exception("Cart not found");

            if (currentUserService.UserID != cart.UserID)
                throw new UnauthorizedAccessException("No permission to access");

            unitOfWork.Carts.Remove(cart);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            return "Cart is removed";
        }
    }
}
