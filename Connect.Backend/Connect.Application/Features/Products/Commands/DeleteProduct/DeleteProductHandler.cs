using Connect.Application.Interfaces.Persistences;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Products.Commands.DeleteProduct
{
    internal sealed class DeleteProductHandler : IRequestHandler<DeleteProductCommand, string>
    {
        private readonly IUnitOfWork unitOfWork;
        public DeleteProductHandler(IUnitOfWork _unitOfWork)
        {
            unitOfWork = _unitOfWork;
        }

        public async Task<string> Handle(DeleteProductCommand request, CancellationToken cancellationToken)
        {
            var product = await unitOfWork.Products.GetByIdAsync(request.ProductID, cancellationToken);
            if (product == null)
                throw new Exception("Product not found");

            unitOfWork.Products.Remove(product);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            return "Product is removed";
        }
    }
}
