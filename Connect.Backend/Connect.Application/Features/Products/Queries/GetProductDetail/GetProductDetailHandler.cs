using Connect.Application.Commons.DTOs;
using Connect.Application.Interfaces.Persistences;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Products.Queries.GetProductDetail
{
    internal sealed class GetProductDetailHandler : IRequestHandler<GetProductDetailQuery, ProductDto>
    {
        private readonly IUnitOfWork unitOfWork;
        public GetProductDetailHandler(IUnitOfWork _unitOfWork)
        {
            unitOfWork = _unitOfWork;
        }

        public async Task<ProductDto> Handle(GetProductDetailQuery request, CancellationToken cancellationToken)
        {
            var product = await unitOfWork.Products.GetByIdAsync(request.ProductID, cancellationToken);
            if (product == null)
                throw new Exception("No products found");

            return new ProductDto
            {
                ProductID = product.ProductID,
                CategoryID = product.CategoryID,
                ProductName = product.ProductName.Value,
                Description = product.Description,
                OriginalPrice = product.OriginalPrice.Value,
                FinalPrice = product.FinalPrice.Value,
                Stock = product.Stock.Value,
                Ram = product.Ram.Value,
                Rom = product.Rom.Value,
                Color = product.Color,
                ProductStatus = product.ProductStatus.ToString(),
                ImageURL = product.ImageURL,
                CreatedAt = product.CreatedAt
            };
        }
    }
}
