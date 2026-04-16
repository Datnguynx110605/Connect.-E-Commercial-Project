using Connect.Application.DTOs;
using Connect.Application.Interfaces.Persistences;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Categories.Queries.GetAllCategories
{
    internal sealed class GetAllCategoriesHandler : IRequestHandler<GetAllCategoriesQuery, IEnumerable<CategoryDto>>
    {
        private readonly IUnitOfWork unitOfWork;
        public GetAllCategoriesHandler(IUnitOfWork _unitOfWork)
        {
            unitOfWork = _unitOfWork;
        }

        public async Task<IEnumerable<CategoryDto>> Handle(GetAllCategoriesQuery request, CancellationToken cancellationToken)
        {
            var category = await unitOfWork.Categories.GetAllNoTrackingAsync(cancellationToken);
            if (category == null)
                throw new Exception("Category not found");

            return category.Select(x => new CategoryDto
            {
                CategoryID=x.CategoryID,
                CategoryName = x.CategoryName.Value
            });
        }
    }
}
