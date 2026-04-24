using Connect.Application.Interfaces.Persistences;
using Connect.Application.Interfaces.Services;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Reviews.Commands.DeleteReview
{
    internal sealed class DeleteReviewHandler : IRequestHandler<DeleteReviewCommand, string>
    {
        private readonly IUnitOfWork unitOfWork;
        private readonly ICurrentUserService currentUserService;
        public DeleteReviewHandler(IUnitOfWork _unitOfWork, ICurrentUserService _currentUserService)
        {
            unitOfWork = _unitOfWork;
            currentUserService = _currentUserService;
        }

        public async Task<string> Handle(DeleteReviewCommand request, CancellationToken cancellationToken)
        {
            bool identity = await unitOfWork.Users.AnyAsync(x => x.UserID == currentUserService.UserID, cancellationToken);
            if (!identity)
                throw new UnauthorizedAccessException("User is not in the system");

            var review = await unitOfWork.Reviews.GetByIdAsync(request.ReviewID, cancellationToken);
            if (review == null)
                throw new Exception("Review not found");

            if (currentUserService.UserID != review.UserID)
                throw new UnauthorizedAccessException("No permission to access");

            unitOfWork.Reviews.Remove(review);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            return "Review is removed";
        }
    }
}
