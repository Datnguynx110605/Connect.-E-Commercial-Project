using Connect.Application.Interfaces.Persistences;
using Connect.Application.Interfaces.Services;
using Connect.Domain.Core.ValueObjects;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Users.Commands.ForgetPassword
{
    internal sealed class ForgetPasswordHandler : IRequestHandler<ForgetPasswordCommand, string>
    {
        private readonly IUnitOfWork unitOfWork;
        private readonly IPasswordService passwordService;
        private readonly IEmailVerificationService verificationService;
        public ForgetPasswordHandler(IUnitOfWork _unitOfWork, IPasswordService _passwordService, IEmailVerificationService _verificationService)
        {
            unitOfWork = _unitOfWork;
            passwordService = _passwordService;
            verificationService = _verificationService;
        }

        public async Task<string> Handle(ForgetPasswordCommand request, CancellationToken cancellationToken)
        {
            string verifiedEmail = verificationService.UnprotectToken(request.RegistrationSessionToken, "registration-session");

            var identity = await unitOfWork.Users.FirstOrDefaultAsync(x => x.Email.Value == verifiedEmail, cancellationToken);
            if (identity == null)
                throw new Exception("User is not in the system");

            string newPasswordHash = passwordService.Hash(request.NewPasswordHash);

            identity.UpdateUserPassword(PasswordHash.Create(newPasswordHash));

            unitOfWork.Users.Update(identity);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            return "Update password successfully";
        }
    }
}
