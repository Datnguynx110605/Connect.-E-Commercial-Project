using Connect.Application.DTOs;
using Connect.Application.Interfaces.Persistences;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Products.Commands.UpdateProductImage
{
    internal sealed class UpdateProductImageHandler : IRequestHandler<UpdateProductImageCommand, ProductDto>
    {
        private readonly IUnitOfWork unitOfWork;
        public UpdateProductImageHandler(IUnitOfWork _unitOfWork)
        {
            unitOfWork = _unitOfWork;
        }

        public async Task<ProductDto> Handle(UpdateProductImageCommand request, CancellationToken cancellationToken)
        {
            var product = await unitOfWork.Products.GetByIdAsync(request.ProductID, cancellationToken);
            if (product == null)
                throw new Exception("Product not found");

            product.UpdateProductImage(request.ImageURL);

            unitOfWork.Products.Update(product);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            return new ProductDto
            {
                ImageURL = product.ImageURL
            };
        }
    }
}
