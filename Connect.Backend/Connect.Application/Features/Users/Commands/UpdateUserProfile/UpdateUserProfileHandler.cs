using Connect.Application.Commons.DTOs;
using Connect.Application.Interfaces.Persistences;
using Connect.Application.Interfaces.Services;
using Connect.Domain.Core.Entities;
using Connect.Domain.Core.ValueObjects;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Users.Commands.UpdateUserProfile
{
    internal sealed class UpdateUserProfileHandler : IRequestHandler<UpdateUserProfileCommand, UserDto>
    {
        private readonly IUnitOfWork unitOfWork;
        private readonly ICurrentUserService currentUserService;
        public UpdateUserProfileHandler(IUnitOfWork _unitOfWork, ICurrentUserService _currentUserService)
        {
            unitOfWork = _unitOfWork;
            currentUserService = _currentUserService;
        }

        public async Task<UserDto> Handle(UpdateUserProfileCommand request, CancellationToken cancellationToken)
        {
            var identity = await unitOfWork.Users.GetByIdAsync(currentUserService.UserID, cancellationToken);
            if (identity == null)
                throw new Exception("User not found");

            identity.UpdateUserProfile
                (UserName.Create(request.UserName),
                Email.Create(request.Email),
                PhoneNumber.Create(request.PhoneNumber),
                request.Address);

            unitOfWork.Users.Update(identity);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            return new UserDto
            {
                UserID = identity.UserID,
                UserName = identity.UserName.Value,
                Email = identity.Email.Value,
                PhoneNumber = identity.PhoneNumber.Value,
                Address = identity.Address,
                CreatedAt = identity.CreatedAt
            };
        }
    }
}
