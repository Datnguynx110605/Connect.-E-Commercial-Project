using Connect.Application.DTOs;
using Connect.Application.Interfaces.Persistences;
using Connect.Domain.Core.Entities;
using Connect.Domain.Core.Enums;
using Connect.Domain.Core.ValueObjects;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Products.Commands.CreateProduct
{
    internal sealed class CreateProductHandler : IRequestHandler<CreateProductCommand, ProductDto>
    {
        private readonly IUnitOfWork unitOfWork;
        public CreateProductHandler(IUnitOfWork _unitOfWork)
        {
            unitOfWork = _unitOfWork;
        }

        public async Task<ProductDto> Handle(CreateProductCommand request, CancellationToken cancellationToken)
        {
            int categoryID = request.CategoryID;
            ProductName name = ProductName.Create(request.ProductName);
            string description = request.Description;
            Currency originalPrice = Currency.Create(request.OriginalPrice);
            Currency finalPrice = Currency.Create(request.FinalPrice);
            Amount stock = Amount.Create(request.Stock);
            Amount ram = Amount.Create(request.Ram);
            Amount rom = Amount.Create(request.Rom);
            string color = request.Color;
            List<string> imageURL = request.ImageURL;

            Product product=Product.CreateProduct(categoryID, name, description, originalPrice, finalPrice, stock, ram, rom, color, imageURL);

            await unitOfWork.Products.AddAsync(product, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            return new ProductDto
            {
                ProductID=product.ProductID,
                ProductName = product.ProductName.Value,
                Description = product.Description,
                OriginalPrice = product.OriginalPrice.Value,
                FinalPrice = product.FinalPrice.Value,
                Stock = product.Stock.Value,
                Ram = product.Ram.Value,
                Rom = product.Rom.Value,
                Color = product.Color,
                ProductStatus = product.ProductStatus.ToString(),
                ImageURL = imageURL,
                CreatedAt=product.CreatedAt
            };
        }
    }
}
