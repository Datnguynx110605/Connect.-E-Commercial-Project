using Connect.Application.Commons.DTOs;
using Connect.Application.Interfaces.Persistences;
using Connect.Domain.Core.ValueObjects;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Products.Queries.GetProductByROM
{
    internal sealed class GetProductByROMHandler : IRequestHandler<GetProductByROMQuery, ProductDto>
    {
        private readonly IUnitOfWork unitOfWork;
        public GetProductByROMHandler(IUnitOfWork _unitOfWork)
        {
            unitOfWork = _unitOfWork;
        }

        public async Task<ProductDto> Handle(GetProductByROMQuery request, CancellationToken cancellationToken)
        {
            Amount rom = Amount.Create(request.Rom);
            var product = await unitOfWork.Products.FirstOrDefaultNoTrackingAsync(x => x.Rom == rom, cancellationToken);
            if (product == null)
                throw new Exception("Product not found");

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
