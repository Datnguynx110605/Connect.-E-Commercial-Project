using Connect.Application.Commons.DTOs;
using Connect.Application.Interfaces.Persistences;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Carts.Queries.GetAllCarts
{
    internal sealed class GetAllCartsHandler : IRequestHandler<GetAllCartsQuery, PagedResult<CartDto>>
    {
        private readonly IUnitOfWork unitOfWork;
        public GetAllCartsHandler(IUnitOfWork _unitOfWork)
        {
            unitOfWork = _unitOfWork;
        }

        public async Task<PagedResult<CartDto>> Handle(GetAllCartsQuery request, CancellationToken cancellationToken)
        {
            var (items, total) = await unitOfWork.Carts.GetPagedAsync(request.Page, request.PageSize, cancellationToken: cancellationToken);

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
