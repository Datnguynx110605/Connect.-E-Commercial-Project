using Connect.Application.DTOs;
using Connect.Application.Interfaces.Persistences;
using Connect.Domain.Core.Entities;
using Connect.Domain.Core.ValueObjects;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Categories.Commands.CreateCategory
{
    internal sealed class CreateCategoryHandler : IRequestHandler<CreateCategoryCommand, CategoryDto>
    {
        private readonly IUnitOfWork unitOfWork;
        public CreateCategoryHandler(IUnitOfWork _unitOfWork)
        {
            unitOfWork = _unitOfWork;
        }

        public async Task<CategoryDto> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
        {
            CategoryName name = CategoryName.Create(request.CategoryName);

            Category category = Category.CreateCategory(name);

            await unitOfWork.Categories.AddAsync(category, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            return new CategoryDto
            {
                CategoryName = category.CategoryName.Value
            };
        }
    }
}
