using Connect.Application.Commons.DTOs;
using Connect.Application.Interfaces.Persistences;
using Connect.Domain.Core.Entities;
using Connect.Domain.Core.ValueObjects;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Categories.Queries.GetAllCategories
{
    internal sealed class GetAllCategoriesHandler : IRequestHandler<GetAllCategoriesQuery, PagedResult<CategoryDto>>
    {
        private readonly IUnitOfWork unitOfWork;
        public GetAllCategoriesHandler(IUnitOfWork _unitOfWork)
        {
            unitOfWork = _unitOfWork;
        }

        public async Task<PagedResult<CategoryDto>> Handle(GetAllCategoriesQuery request, CancellationToken cancellationToken)
        {
            var (items, total) = await unitOfWork.Categories.GetPagedAsync(request.Page, request.PageSize, cancellationToken: cancellationToken);

            return new PagedResult<CategoryDto>
            {
                Items = items.Select(x => new CategoryDto
                {
                    CategoryID = x.CategoryID,
                    CategoryName = x.CategoryName.Value
                }).ToList(),
                TotalCount = total,
                Page = request.Page,
                PageSize = request.PageSize
            };
        }
    }
}
