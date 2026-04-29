using Connect.Application.Commons.DTOs;
using Connect.Application.Interfaces.Persistences;
using Connect.Domain.Core.ValueObjects;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Products.Queries.GetProductByPriceRange
{
    internal sealed class GetProductByPriceRangeHandler : IRequestHandler<GetProductByPriceRangeQuery, PagedResult<ProductDto>>
    {
        private readonly IUnitOfWork unitOfWork;
        public GetProductByPriceRangeHandler(IUnitOfWork _unitOfWork)
        {
            unitOfWork = _unitOfWork;
        }

        public async Task<PagedResult<ProductDto>> Handle(GetProductByPriceRangeQuery request, CancellationToken cancellationToken)
        {
            Currency fromPrice = Currency.Create(request.FromPrice);
            Currency toPrice = Currency.Create(request.ToPrice);
            var (items, total) = await unitOfWork.Products.GetPagedAsync(request.Page, request.PageSize, filter: x => x.FinalPrice >= fromPrice && x.FinalPrice <= toPrice, cancellationToken);
            if (!items.Any())
                throw new Exception("No products found");

            return new PagedResult<ProductDto>
            {
                Items = items.Select(x => new ProductDto
                {
                    ProductID = x.ProductID,
                    CategoryID = x.CategoryID,
                    ProductName = x.ProductName.Value,
                    Description = x.Description,
                    OriginalPrice = x.OriginalPrice.Value,
                    FinalPrice = x.FinalPrice.Value,
                    Stock = x.Stock.Value,
                    Ram = x.Ram.Value,
                    Rom = x.Rom.Value,
                    Color = x.Color,
                    ImageURL = x.ImageURL,
                    ProductStatus = x.ProductStatus.ToString(),
                    CreatedAt = x.CreatedAt
                }).ToList(),
                TotalCount = total,
                Page = request.Page,
                PageSize = request.PageSize
            };
        }
    }
}
