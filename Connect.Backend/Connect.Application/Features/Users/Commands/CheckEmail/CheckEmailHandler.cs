using Connect.Application.Interfaces.Persistences;
using Connect.Application.Interfaces.Services;
using Connect.Domain.Core.ValueObjects;
using FluentResults;
using MediatR;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Users.Commands.CheckEmail
{
    internal sealed class CheckEmailHandler : IRequestHandler<CheckEmailCommand, Result>
    {
        private readonly IUnitOfWork unitOfWork;
        private readonly IEmailVerificationService verificationService;
        private readonly IEmailService emailService;
        public CheckEmailHandler(IUnitOfWork _unitOfWork, IEmailVerificationService _verificationService, IEmailService _emailService)
        {
            unitOfWork = _unitOfWork;
            verificationService = _verificationService;
            emailService = _emailService;
        }

        public async Task<Result> Handle(CheckEmailCommand request, CancellationToken cancellationToken)
        {
            Email email = Email.Create(request.Email);

            bool emailExist = await unitOfWork.Users.AnyAsync(x => x.Email == email, cancellationToken);
            if (emailExist)
                throw new Exception("Email already exists");

            var token = verificationService.GenerateVerificationToken(email.Value);

            var encodedToken = Uri.EscapeDataString(token);
            var verificationUrl = $"http://localhost:3000/verify-email?token={encodedToken}";

            await emailService.SendEmailVerificationAsync(email.Value, verificationUrl, cancellationToken);

            return Result.Ok();
        }
    }
}
