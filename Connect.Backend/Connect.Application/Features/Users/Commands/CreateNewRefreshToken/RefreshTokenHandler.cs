using Connect.Application.Commons.DTOs;
using Connect.Application.Interfaces.Persistences;
using Connect.Application.Interfaces.Services;
using Connect.Domain.Core.Entities;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Users.Commands.CreateNewRefreshToken
{
    internal sealed class RefreshTokenHandler : IRequestHandler<RefreshTokenCommand, RefreshTokenDto>
    {
        private readonly IUnitOfWork unitOfWork;
        private readonly IJWTService jwtService;
        public RefreshTokenHandler(IUnitOfWork _unitOfWork, IJWTService _jwtService)
        {
            unitOfWork = _unitOfWork;
            jwtService = _jwtService;
        }

        public async Task<RefreshTokenDto> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
        {
            var user = await unitOfWork.Users.GetByIdAsync(request.UserID, cancellationToken);
            if (user == null)
                throw new Exception("User not found");

            var refreshToken = await unitOfWork.RefreshTokens.FirstOrDefaultAsync(x => x.RefreshTokens == request.RefreshToken, cancellationToken);
            if (refreshToken == null)
                throw new Exception("RefreshToken not found");

            if (user.UserID != refreshToken.UserID)
                throw new Exception("RefreshToken does not belong to this user");

            refreshToken.VerifyRefreshToken();
            refreshToken.RevokeRefreshToken();

            RefreshToken newRefreshToken = RefreshToken.CreateRefreshToken(user.UserID);

            await unitOfWork.BeginTransactionAsync(cancellationToken);
            unitOfWork.RefreshTokens.Update(refreshToken);
            await unitOfWork.RefreshTokens.AddAsync(newRefreshToken, cancellationToken);
            await unitOfWork.CommitTransactionAsync(cancellationToken);

            var newAccessToken = jwtService.GenerateAccessToken(user);

            return new RefreshTokenDto
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken.RefreshTokens
            };
        }
    }
}
