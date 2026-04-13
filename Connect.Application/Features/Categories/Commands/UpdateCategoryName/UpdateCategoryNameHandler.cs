using Connect.Application.DTOs;
using Connect.Application.Interfaces.Persistences;
using Connect.Domain.Core.ValueObjects;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Categories.Commands.UpdateCategoryName
{
    internal sealed class UpdateCategoryNameHandler : IRequestHandler<UpdateCategoryNameCommand, CategoryDto>
    {
        private readonly IUnitOfWork unitOfWork;
        public UpdateCategoryNameHandler(IUnitOfWork _unitOfWork)
        {
            unitOfWork = _unitOfWork;
        }

        public async Task<CategoryDto> Handle(UpdateCategoryNameCommand request, CancellationToken cancellationToken)
        {
            var category = await unitOfWork.Categories.GetByIdAsync(request.CategoryID, cancellationToken);
            if (category == null)
                throw new Exception("Category not found");

            category.UpdateCategoryName(CategoryName.Create(request.CategoryName));

            unitOfWork.Categories.Update(category);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            return new CategoryDto
            {
                CategoryName = category.CategoryName.Value
            };
        }
    }
}
