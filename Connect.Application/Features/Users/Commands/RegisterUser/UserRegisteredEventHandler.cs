using Connect.Application.Commons;
using Connect.Application.Features.Orders.Commands.CreateOrder;
using Connect.Application.Interfaces.Services;
using Connect.Domain.Events.UserEvents;
using Hangfire;
using MediatR;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Users.Commands.RegisterUser
{
    internal sealed class UserRegisteredEventHandler : INotificationHandler<DomainEventNotification<UserRegisteredEvent>>
    {
        private readonly IBackgroundJobClient backgroundJobClient;
        private readonly ILogger<UserRegisteredEventHandler> logger;

        public UserRegisteredEventHandler(IBackgroundJobClient _backgroundJobClient, ILogger<UserRegisteredEventHandler> _logger)
        {
            backgroundJobClient = _backgroundJobClient;
            logger = _logger;
        }

        public Task Handle(DomainEventNotification<UserRegisteredEvent> notification, CancellationToken cancellationToken)
        {
            var otpCode = GenerateOtp();

            logger.LogInformation("Taking event UserRegistered for user {UserEmail}. Waiting to send OTP email...",notification.Event.UserEmail.Value);

            backgroundJobClient.Enqueue<IEmailService>(emailService =>
                emailService.SendOtpEmailAsync(
                notification.Event.UserEmail.Value,
                otpCode,
                CancellationToken.None));

            return Task.CompletedTask;
        }

        private static string GenerateOtp()
        {
            return Random.Shared.Next(100_000, 999_999).ToString();
        }
    }
}
