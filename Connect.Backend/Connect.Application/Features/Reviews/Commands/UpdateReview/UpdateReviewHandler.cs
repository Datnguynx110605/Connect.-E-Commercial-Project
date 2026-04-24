using Connect.Application.Commons.DTOs;
using Connect.Application.Interfaces.Persistences;
using Connect.Application.Interfaces.Services;
using Connect.Domain.Core.ValueObjects;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Reviews.Commands.UpdateReview
{
    internal sealed class UpdateReviewHandler : IRequestHandler<UpdateReviewCommand, ReviewDto>
    {
        private readonly IUnitOfWork unitOfWork;
        private readonly ICurrentUserService currentUserService;
        public UpdateReviewHandler(IUnitOfWork _unitOfWork, ICurrentUserService _currentUserService)
        {
            unitOfWork = _unitOfWork;
            currentUserService = _currentUserService;
        }

        public async Task<ReviewDto> Handle(UpdateReviewCommand request, CancellationToken cancellationToken)
        {
            bool identity = await unitOfWork.Users.AnyAsync(x => x.UserID == currentUserService.UserID, cancellationToken);
            if (!identity)
                throw new UnauthorizedAccessException("User is not in the system");

            var review = await unitOfWork.Reviews.GetByIdAsync(request.ReviewID, cancellationToken);
            if (review == null)
                throw new Exception("Review not found");

            if (currentUserService.UserID != review.UserID)
                throw new UnauthorizedAccessException("No permission to access");

            review.UpdateReview(
                Amount.Create(request.Rating),
                request.Body);

            unitOfWork.Reviews.Update(review);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            return new ReviewDto
            {
                ReviewID = review.ReviewID,
                UserID = review.UserID,
                ProductID = review.ProductID,
                Rating = review.Rating.Value,
                Body = review.Body,
                CreatedAt = review.CreatedAt
            };
        }
    }
}
