using Connect.Application.Commons.DTOs;
using Connect.Application.Interfaces.Persistences;
using Connect.Domain.Core.ValueObjects;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Products.Queries.GetProductByRAM
{
    internal sealed class GetProductByRAMHandler : IRequestHandler<GetProductByRAMQuery, ProductDto>
    {
        private readonly IUnitOfWork unitOfWork;
        public GetProductByRAMHandler(IUnitOfWork _unitOfWork)
        {
            unitOfWork = _unitOfWork;
        }

        public async Task<ProductDto> Handle(GetProductByRAMQuery request, CancellationToken cancellationToken)
        {
            Amount ram = Amount.Create(request.Ram);
            var product = await unitOfWork.Products.FirstOrDefaultNoTrackingAsync(x => x.Ram == ram, cancellationToken);
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
