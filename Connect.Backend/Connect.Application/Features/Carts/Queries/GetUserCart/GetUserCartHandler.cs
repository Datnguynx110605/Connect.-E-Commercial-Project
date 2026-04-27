using Connect.Application.Commons.DTOs;
using Connect.Application.Interfaces.Persistences;
using Connect.Application.Interfaces.Services;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Carts.Queries.GetUserCart
{
    internal sealed class GetUserCartHandler : IRequestHandler<GetUserCartQuery, IEnumerable<CartDto>>
    {
        private readonly IUnitOfWork unitOfWork;
        private readonly ICurrentUserService currentUserService;
        public GetUserCartHandler(IUnitOfWork _unitOfWork, ICurrentUserService _currentUserService)
        {
            unitOfWork = _unitOfWork;
            currentUserService = _currentUserService;
        }

        public async Task<IEnumerable<CartDto>> Handle(GetUserCartQuery request, CancellationToken cancellationToken)
        {
            bool identity = await unitOfWork.Users.AnyAsync(x => x.UserID == currentUserService.UserID, cancellationToken);
            if (!identity)
                throw new UnauthorizedAccessException("User is not in the system");

            var cart = await unitOfWork.Carts.WhereNoTrackingAsync(x => x.UserID ==currentUserService.UserID, cancellationToken);
            if (cart == null)
                throw new Exception("Cart not found");

            return cart.Select(x => new CartDto
            {
                CartID = x.CartID,
                UserID = x.UserID,
                ProductID = x.ProductID,
                CartQuantity = x.CartQuantity.Value,
                CartUnitPrice = x.CartUnitPrice.Value,
                CartTotalPrice = x.CartTotalPrice.Value
            }).ToList();
        }
    }
}
