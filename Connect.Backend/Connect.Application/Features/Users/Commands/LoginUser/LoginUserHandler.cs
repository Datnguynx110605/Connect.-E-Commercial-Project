using Connect.Application.Commons.DTOs;
using Connect.Application.Interfaces.Persistences;
using Connect.Application.Interfaces.Services;
using Connect.Domain.Core.Entities;
using Connect.Domain.Core.ValueObjects;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Users.Commands.LoginUser
{
    internal sealed class LoginUserHandler : IRequestHandler<LoginUserCommand, RefreshTokenDto>
    {
        private readonly IUnitOfWork unitOfWork;
        private readonly IPasswordService passwordService;
        private readonly IJWTService jwtService;
        public LoginUserHandler(IUnitOfWork _unitOfWork, IPasswordService _passwordService, IJWTService _jwtService)
        {
            unitOfWork = _unitOfWork;
            passwordService = _passwordService;
            jwtService = _jwtService;
        }

        public async Task<RefreshTokenDto> Handle(LoginUserCommand request, CancellationToken cancellationToken)
        {
            Email email = Email.Create(request.Email);
            var user = await unitOfWork.Users.FirstOrDefaultNoTrackingAsync(x => x.Email == email, cancellationToken);
            if (user == null)
                throw new Exception("Email or password is incorrect");

            var isPasswordHashedValid = passwordService.Verify(request.Password, user.PasswordHash.Value);
            if (!isPasswordHashedValid)
                throw new Exception("Email or password is incorrect");

            var accessToken = jwtService.GenerateAccessToken(user);
            RefreshToken refreshToken = RefreshToken.CreateRefreshToken(user.UserID);

            await unitOfWork.RefreshTokens.AddAsync(refreshToken, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            return new RefreshTokenDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken.RefreshTokens
            };
        }
    }
}
