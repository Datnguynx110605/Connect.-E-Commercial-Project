using Connect.Application.DTOs;
using Connect.Application.Interfaces.Persistences;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Reviews.Queries.GetReviewByProduct
{
    internal sealed class GetReviewByProductHandler : IRequestHandler<GetReviewByProductQuery, ReviewDto>
    {
        private readonly IUnitOfWork unitOfWork;
        public GetReviewByProductHandler(IUnitOfWork _unitOfWork)
        {
            unitOfWork = _unitOfWork;
        }

        public async Task<ReviewDto> Handle(GetReviewByProductQuery request, CancellationToken cancellationToken)
        {
            var review = await unitOfWork.Reviews.GetByIdAsync(request.ProductID, cancellationToken);
            if (review == null)
                throw new Exception("Review not found");

            return new ReviewDto
            {
                UserID = review.UserID,
                ProductID = review.ProductID,
                Rating = review.Rating.Value,
                Body = review.Body
            };
        }
    }
}
