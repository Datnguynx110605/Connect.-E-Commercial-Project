using Connect.Application.Commons.DTOs;
using Connect.Application.Interfaces.Persistences;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Products.Queries.GetProductByCategory
{
    internal sealed class GetProductByCategoryHandler : IRequestHandler<GetProductByCategoryQuery, ProductDto>
    {
        private readonly IUnitOfWork unitOfWork;
        public GetProductByCategoryHandler(IUnitOfWork _unitOfWork)
        {
            unitOfWork = _unitOfWork;
        }

        public async Task<ProductDto> Handle(GetProductByCategoryQuery request, CancellationToken cancellationToken)
        {
            var product = await unitOfWork.Products.FirstOrDefaultNoTrackingAsync(x => x.CategoryID == request.CategoryID, cancellationToken);
            if (product == null)
                throw new Exception("Product not found");

            return new ProductDto
            {
                ProductID = product.ProductID,
                CategoryID=product.CategoryID,
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
