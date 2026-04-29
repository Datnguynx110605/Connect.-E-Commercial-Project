using Connect.Application.Commons.DTOs;
using Connect.Application.Interfaces.Persistences;
using Connect.Application.Interfaces.Services;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Carts.Queries.GetUserCart
{
    internal sealed class GetUserCartHandler : IRequestHandler<GetUserCartQuery, PagedResult<CartDto>>
    {
        private readonly IUnitOfWork unitOfWork;
        private readonly ICurrentUserService currentUserService;
        public GetUserCartHandler(IUnitOfWork _unitOfWork, ICurrentUserService _currentUserService)
        {
            unitOfWork = _unitOfWork;
            currentUserService = _currentUserService;
        }

        public async Task<PagedResult<CartDto>> Handle(GetUserCartQuery request, CancellationToken cancellationToken)
        {
            bool identity = await unitOfWork.Users.AnyAsync(x => x.UserID == currentUserService.UserID, cancellationToken);
            if (!identity)
                throw new UnauthorizedAccessException("User is not in the system");

            var (items, total) = await unitOfWork.Carts.GetPagedAsync(request.Page, request.PageSize, filter: x => x.UserID == currentUserService.UserID, cancellationToken);
            if (!items.Any())
                throw new Exception("No carts found");

            return new PagedResult<CartDto>
            {
                Items = items.Select(x => new CartDto
                {
                    CartID = x.CartID,
                    UserID = x.UserID,
                    ProductID = x.ProductID,
                    CartQuantity = x.CartQuantity.Value,
                    CartUnitPrice = x.CartUnitPrice.Value,
                    CartTotalPrice = x.CartTotalPrice.Value
                }).ToList(),
                TotalCount = total,
                Page = request.Page,
                PageSize = request.PageSize
            };
        }
    }
}
