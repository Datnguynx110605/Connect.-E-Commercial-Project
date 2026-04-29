using Connect.Application.Commons.DTOs;
using Connect.Application.Interfaces.Persistences;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Reviews.Queries.GetAllReviews
{
    internal sealed class GetAllReviewsHandler : IRequestHandler<GetAllReviewsQuery, PagedResult<ReviewDto>>
    {
        private readonly IUnitOfWork unitOfWork;
        public GetAllReviewsHandler(IUnitOfWork _unitOfWork)
        {
            unitOfWork = _unitOfWork;
        }

        public async Task<PagedResult<ReviewDto>> Handle(GetAllReviewsQuery request, CancellationToken cancellationToken)
        {
            var (items, total) = await unitOfWork.Reviews.GetPagedAsync(request.Page, request.PageSize, cancellationToken: cancellationToken);

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
