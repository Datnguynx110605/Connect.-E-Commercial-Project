using Connect.Application.Interfaces.Persistences;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Categories.Commands.DeleteCategory
{
    internal sealed class DeleteCategoryHandler : IRequestHandler<DeleteCategoryCommand, string>
    {
        private readonly IUnitOfWork unitOfWork;
        public DeleteCategoryHandler(IUnitOfWork _unitOfWork)
        {
            unitOfWork = _unitOfWork;
        }

        public async Task<string> Handle(DeleteCategoryCommand request, CancellationToken cancellationToken)
        {
            var category = await unitOfWork.Categories.GetByIdAsync(request.CategoryID, cancellationToken);
            if (category == null)
                throw new Exception("Category not found");

            unitOfWork.Categories.Remove(category);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            return "Category is removed";
        }
    }
}
