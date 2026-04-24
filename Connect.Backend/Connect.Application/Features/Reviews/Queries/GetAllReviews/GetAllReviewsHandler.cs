using Connect.Application.Commons.DTOs;
using Connect.Application.Interfaces.Persistences;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Reviews.Queries.GetAllReviews
{
    internal sealed class GetAllReviewsHandler : IRequestHandler<GetAllReviewsQuery, IEnumerable<ReviewDto>>
    {
        private readonly IUnitOfWork unitOfWork;
        public GetAllReviewsHandler(IUnitOfWork _unitOfWork)
        {
            unitOfWork = _unitOfWork;
        }

        public async Task<IEnumerable<ReviewDto>> Handle(GetAllReviewsQuery request, CancellationToken cancellationToken)
        {
            var review = await unitOfWork.Reviews.GetAllNoTrackingAsync(cancellationToken);
            if (review == null)
                throw new Exception("Review not found");

            return review.Select(x => new ReviewDto
            {
                ReviewID=x.ReviewID,
                UserID=x.UserID,
                ProductID=x.ProductID,
                Rating=x.Rating.Value,
                Body=x.Body,
                CreatedAt=x.CreatedAt
            });
        }
    }
}
