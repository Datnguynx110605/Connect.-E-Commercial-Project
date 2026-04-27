using Connect.Application.Commons.DTOs;
using Connect.Application.Interfaces.Persistences;
using Connect.Domain.Core.ValueObjects;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Products.Queries.GetProductByRAM
{
    internal sealed class GetProductByRAMHandler : IRequestHandler<GetProductByRAMQuery, IEnumerable<ProductDto>>
    {
        private readonly IUnitOfWork unitOfWork;
        public GetProductByRAMHandler(IUnitOfWork _unitOfWork)
        {
            unitOfWork = _unitOfWork;
        }

        public async Task<IEnumerable<ProductDto>> Handle(GetProductByRAMQuery request, CancellationToken cancellationToken)
        {
            Amount ram = Amount.Create(request.Ram);
            var product = await unitOfWork.Products.WhereNoTrackingAsync(x => x.Ram == ram, cancellationToken);
            if (product == null)
                throw new Exception("Product not found");

            return product.Select(x => new ProductDto
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
            }).ToList();
        }
    }
}
