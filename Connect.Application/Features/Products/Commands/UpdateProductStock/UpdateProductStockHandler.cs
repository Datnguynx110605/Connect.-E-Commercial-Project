using Connect.Application.DTOs;
using Connect.Application.Interfaces.Persistences;
using Connect.Domain.Core.ValueObjects;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Products.Commands.UpdateProductStock
{
    internal sealed class UpdateProductStockHandler : IRequestHandler<UpdateProductStockCommand, ProductDto>
    {
        private readonly IUnitOfWork unitOfWork;
        public UpdateProductStockHandler(IUnitOfWork _unitOfWork)
        {
            unitOfWork = _unitOfWork;
        }

        public async Task<ProductDto> Handle(UpdateProductStockCommand request, CancellationToken cancellationToken)
        {
            var product = await unitOfWork.Products.GetByIdAsync(request.ProductID,cancellationToken);
            if (product == null)
                throw new Exception("Product not found");

            product.AddToStock(Amount.Create(request.Stock));

            unitOfWork.Products.Update(product);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            return new ProductDto
            {
                Stock = product.Stock.Value
            };
        }
    }
}
