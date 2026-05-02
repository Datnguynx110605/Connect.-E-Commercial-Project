using Connect.Application.Commons.DTOs;
using Connect.Application.Interfaces.Persistences;
using Connect.Application.Interfaces.Services;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Users.Queries.GetUserProfile
{
    internal sealed class GetUserProfileHandler : IRequestHandler<GetUserProfileQuery, UserDto>
    {
        private readonly IUnitOfWork unitOfWork;
        private readonly ICurrentUserService currentUserService;
        public GetUserProfileHandler(IUnitOfWork _unitOfWork, ICurrentUserService _currentUserService)
        {
            unitOfWork = _unitOfWork;
            currentUserService = _currentUserService;
        }

        public async Task<UserDto> Handle(GetUserProfileQuery request, CancellationToken cancellationToken)
        {
            var identity = await unitOfWork.Users.GetByIdAsync(currentUserService.UserID, cancellationToken);
            if (identity == null)
                throw new Exception("User is not in the system");

            return new UserDto
            {
                UserName = identity.UserName.Value,
                Email = identity.Email.Value,
                PhoneNumber = identity.PhoneNumber?.Value ?? string.Empty, 
                Address = identity.Address ?? string.Empty,
                OAuthProviderName =identity.OAuthProviderName,
                CreatedAt = identity.CreatedAt
            };
        }
    }
}
