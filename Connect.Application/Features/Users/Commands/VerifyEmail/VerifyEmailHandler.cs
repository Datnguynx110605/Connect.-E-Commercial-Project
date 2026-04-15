using Connect.Application.Interfaces.Services;
using FluentResults;
using MediatR;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Users.Commands.VerifyEmail
{
    internal sealed class VerifyEmailHandler : IRequestHandler<VerifyEmailCommand, Result<VerifyEmailResponse>>
    {
        private readonly IEmailVerificationService verificationService;
        private readonly ILogger<VerifyEmailHandler> logger;
        public VerifyEmailHandler(IEmailVerificationService _verificationService, ILogger<VerifyEmailHandler> _logger)
        {
            verificationService = _verificationService;
            logger = _logger;
        }

        public Task<Result<VerifyEmailResponse>> Handle(VerifyEmailCommand request, CancellationToken cancellationToken)
        {
            string email;

            try
            {
                email = verificationService.UnprotectToken(request.Token,"email-verification");
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Invalid or expired email verification token");

                return Task.FromResult(Result.Fail<VerifyEmailResponse>("InvalidOrExpiredVerificationToken"));
            }

            var sessionToken = verificationService.GenerateRegistrationSessionToken(email);

            return Task.FromResult(Result.Ok(new VerifyEmailResponse(sessionToken)));
        }
    }
}
