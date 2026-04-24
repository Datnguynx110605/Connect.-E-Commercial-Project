using Connect.Application.DTOs;
using Connect.Application.Interfaces.Persistences;
using Connect.Application.Interfaces.Services;
using Connect.Domain.Core.Entities;
using Connect.Domain.Core.ValueObjects;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Users.Commands.UpdateUserPassword
{
    internal sealed class UpdateUserPasswordHandler : IRequestHandler<UpdateUserPasswordCommand, string>
    {
        private readonly IUnitOfWork unitOfWork;
        private readonly IPasswordService passwordService;
        private readonly ICurrentUserService currentUserService;
        public UpdateUserPasswordHandler(IUnitOfWork _unitOfWork, IPasswordService _passwordService, ICurrentUserService _currentUserService)
        {
            unitOfWork = _unitOfWork;
            passwordService = _passwordService;
            currentUserService = _currentUserService;
        }

        public async Task<string> Handle(UpdateUserPasswordCommand request, CancellationToken cancellationToken)
        {
            var identity = await unitOfWork.Users.GetByIdAsync(currentUserService.UserID, cancellationToken);
            if (identity == null)
                throw new Exception("User is not in the system");

            if (!passwordService.Verify(request.OldPassword, identity.PasswordHash.Value))
                throw new Exception("Password does not match");

            var newHashedPassword = passwordService.Hash(request.Password);

            identity.UpdateUserPassword(PasswordHash.Create(newHashedPassword));

            unitOfWork.Users.Update(identity);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            return "Update password sucessfully";
        }
    }
}
