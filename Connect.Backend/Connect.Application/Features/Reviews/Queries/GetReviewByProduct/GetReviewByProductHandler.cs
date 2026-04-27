using Connect.Application.Commons.DTOs;
using Connect.Application.Interfaces.Persistences;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Reviews.Queries.GetReviewByProduct
{
    internal sealed class GetReviewByProductHandler : IRequestHandler<GetReviewByProductQuery, IEnumerable<ReviewDto>>
    {
        private readonly IUnitOfWork unitOfWork;
        public GetReviewByProductHandler(IUnitOfWork _unitOfWork)
        {
            unitOfWork = _unitOfWork;
        }

        public async Task<IEnumerable<ReviewDto>> Handle(GetReviewByProductQuery request, CancellationToken cancellationToken)
        {
            var review = await unitOfWork.Reviews.WhereNoTrackingAsync(x => x.ProductID == request.ProductID, cancellationToken);
            if (review == null)
                throw new Exception("Review not found");

            return review.Select(x => new ReviewDto
            {
                ReviewID = x.ReviewID,
                UserID = x.UserID,
                ProductID = x.ProductID,
                Rating = x.Rating.Value,
                Body = x.Body,
                CreatedAt = x.CreatedAt
            }).ToList();
        }
    }
}
