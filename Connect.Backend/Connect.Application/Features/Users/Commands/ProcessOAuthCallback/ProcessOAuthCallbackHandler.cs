using Connect.Application.Commons.DTOs;
using Connect.Application.Interfaces.Persistences;
using Connect.Application.Interfaces.Services;
using Connect.Domain.Core.Entities;
using Connect.Domain.Core.ValueObjects;
using FluentResults;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Users.Commands.ProcessOAuthCallback
{
    internal sealed class ProcessOAuthCallbackHandler : IRequestHandler<ProcessOAuthCallbackCommand, RefreshTokenDto>
    {
        private readonly IUnitOfWork unitOfWork;
        private readonly IJWTService jwtService;
        private readonly IOAuthService oAuthService;
        public ProcessOAuthCallbackHandler(IUnitOfWork _unitOfWork, IJWTService _jwtService, IOAuthService _oAuthService)
        {
            unitOfWork = _unitOfWork;
            jwtService = _jwtService;
            oAuthService = _oAuthService;
        }
        public async Task<RefreshTokenDto> Handle(ProcessOAuthCallbackCommand request, CancellationToken cancellationToken)
        {
            var result = await oAuthService.ParseCallBack(request.HttpRequest);
            Email email = Email.Create(result.Email);
            bool existingEmail = await unitOfWork.Users.AnyAsync(x => x.Email == email, cancellationToken);
            if (existingEmail)
                throw new Exception("Email already exists");

            UserName userName = UserName.Create(result.UserName);
            PhoneNumber phone = PhoneNumber.Create("None");
            PasswordHash passwordHash = PasswordHash.Create("None");

            User user = User.CreateUserProfile(userName, email, phone, passwordHash, "None");

            await unitOfWork.BeginTransactionAsync(cancellationToken);
            await unitOfWork.Users.AddAsync(user, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            RefreshToken refreshToken = RefreshToken.CreateRefreshToken(user.UserID);

            await unitOfWork.RefreshTokens.AddAsync(refreshToken);
            await unitOfWork.CommitTransactionAsync(cancellationToken);

            var accessToken= jwtService.GenerateAccessToken(user);

            return new RefreshTokenDto
            {
                AccessToken = accessToken,
                RefreshToken=refreshToken.RefreshTokens
            };

        }
    }
}
