using Connect.Application.Commons.DTOs;
using Connect.Application.Interfaces.Persistences;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Reviews.Queries.GetReviewByProduct
{
    internal sealed class GetReviewByProductHandler : IRequestHandler<GetReviewByProductQuery, PagedResult<ReviewDto>>
    {
        private readonly IUnitOfWork unitOfWork;
        public GetReviewByProductHandler(IUnitOfWork _unitOfWork)
        {
            unitOfWork = _unitOfWork;
        }

        public async Task<PagedResult<ReviewDto>> Handle(GetReviewByProductQuery request, CancellationToken cancellationToken)
        {
            var (items, total) = await unitOfWork.Reviews.GetPagedAsync(request.Page, request.PageSize, filter: x => x.ProductID == request.ProductID, cancellationToken);
            if (!items.Any())
                throw new Exception("No reviews found");

            return new PagedResult<ReviewDto>
            {
                Items = items.Select(x => new ReviewDto
                {
                    ReviewID = x.ReviewID,
                    UserID = x.UserID,
                    ProductID = x.ProductID,
                    Rating = x.Rating.Value,
                    Body = x.Body,
                    CreatedAt = x.CreatedAt
                }).ToList(),
                TotalCount = total,
                Page = request.Page,
                PageSize = request.PageSize
            };
        }
    }
}
