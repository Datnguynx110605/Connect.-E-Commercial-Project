using Connect.Application.DTOs;
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
                throw new Exception("Product not found");

            return new ProductDto
            {
                ProductName = product.ProductName.Value,
                Description = product.Description,
                OriginalPrice = product.OriginalPrice.Value,
                FinalPrice = product.FinalPrice.Value,
                Stock = product.Stock.Value,
                Ram = product.Ram.Value,
                Rom = product.Rom.Value,
                Color = product.Color,
                ImageURL = product.ImageURL,
                ProductStatus = product.ProductStatus.ToString()
            };
        }
    }
}
