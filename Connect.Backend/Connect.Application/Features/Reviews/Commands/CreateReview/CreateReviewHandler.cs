using Connect.Application.Commons.DTOs;
using Connect.Application.Interfaces.Persistences;
using Connect.Application.Interfaces.Services;
using Connect.Domain.Core.Entities;
using Connect.Domain.Core.ValueObjects;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Reviews.Commands.CreateReview
{
    internal sealed class CreateReviewHandler : IRequestHandler<CreateReviewCommand, ReviewDto>
    {
        private readonly IUnitOfWork unitOfWork;
        private readonly ICurrentUserService currentUserService;
        public CreateReviewHandler(IUnitOfWork _unitOfWork, ICurrentUserService _currentUserService)
        {
            unitOfWork = _unitOfWork;
            currentUserService = _currentUserService;
        }

        public async Task<ReviewDto> Handle(CreateReviewCommand request, CancellationToken cancellationToken)
        {
            bool identity = await unitOfWork.Users.AnyAsync(x => x.UserID == currentUserService.UserID, cancellationToken);
            if (!identity)
                throw new UnauthorizedAccessException("User is not in the system");

            var product = await unitOfWork.Products.GetByIdAsync(request.ProductID, cancellationToken);
            if (product == null)
                throw new Exception("Product not found");

            Amount rating = Amount.Create(request.Rating);
            string body = request.Body;

            Review review = Review.CreateReview(currentUserService.UserID, product.ProductID, rating, body);

            await unitOfWork.Reviews.AddAsync(review, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            return new ReviewDto
            {
                ReviewID=review.ReviewID,
                UserID = review.UserID,
                ProductID = review.ProductID,
                Rating = review.Rating.Value,
                Body = review.Body,
                CreatedAt=review.CreatedAt
            };
        }
    }
}
