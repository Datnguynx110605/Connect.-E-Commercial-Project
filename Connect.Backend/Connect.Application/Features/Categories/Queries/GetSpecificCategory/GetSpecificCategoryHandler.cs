using Connect.Application.Commons.DTOs;
using Connect.Application.Interfaces.Persistences;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Categories.Queries.GetSpecificCategory
{
    internal sealed class GetSpecificCategoryHandler : IRequestHandler<GetSpecificCategoryCommand, CategoryDto>
    {
        private readonly IUnitOfWork unitOfWork;
        public GetSpecificCategoryHandler(IUnitOfWork _unitOfWork)
        {
            unitOfWork = _unitOfWork;
        }

        public async Task<CategoryDto> Handle(GetSpecificCategoryCommand request, CancellationToken cancellationToken)
        {
            var category = await unitOfWork.Categories.GetByIdAsync(request.CategoryID, cancellationToken);
            if (category == null)
                throw new Exception("Category not found");

            return new CategoryDto
            {
                CategoryID=category.CategoryID,
                CategoryName = category.CategoryName.Value
            };
        }
    }
}
