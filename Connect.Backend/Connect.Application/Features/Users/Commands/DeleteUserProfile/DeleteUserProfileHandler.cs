using Connect.Application.Interfaces.Persistences;
using Connect.Application.Interfaces.Services;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Users.Commands.DeleteUserProfile
{
    internal sealed class DeleteUserProfileHandler : IRequestHandler<DeleteUserProfileCommand, string>
    {
        private readonly IUnitOfWork unitOfWork;
        private readonly ICurrentUserService currentUserService;
        public DeleteUserProfileHandler(IUnitOfWork _unitOfWork, ICurrentUserService _currentUserService)
        {
            unitOfWork = _unitOfWork;
            currentUserService = _currentUserService;
        }

        public async Task<string> Handle(DeleteUserProfileCommand request, CancellationToken cancellationToken)
        {
            var user = await unitOfWork.Users.GetByIdAsync(currentUserService.UserID, cancellationToken);
            if (user == null)
                throw new Exception("User not found");

            unitOfWork.Users.Remove(user);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            return "User profile is removed";
        }
    }
}
