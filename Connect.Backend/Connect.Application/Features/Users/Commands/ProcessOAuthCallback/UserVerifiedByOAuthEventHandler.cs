using Connect.Application.Commons;
using Connect.Application.Interfaces.Services;
using Connect.Domain.Events.UserEvents;
using Hangfire;
using MediatR;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Users.Commands.ProcessOAuthCallback
{
    internal sealed class UserVerifiedByOAuthEventHandler : INotificationHandler<DomainEventNotification<UserRegisterEvent>>
    {
        private readonly IBackgroundJobClient backgroundJobClient;
        private readonly ILogger<UserVerifiedByOAuthEventHandler> logger;
        public UserVerifiedByOAuthEventHandler(IBackgroundJobClient _backgroundJobClient, ILogger<UserVerifiedByOAuthEventHandler> _logger)
        {
            backgroundJobClient = _backgroundJobClient;
            logger = _logger;
        }
        public Task Handle(DomainEventNotification<UserRegisterEvent> notification, CancellationToken cancellationToken)
        {
            logger.LogInformation("Take event UserRegisteredEvent for User #{userID}. Waiting to send email... ", notification.Event.UserName);

            backgroundJobClient.Enqueue<IEmailService>(emailService => emailService.SendWelcomeEmailAsync(
                notification.Event.UserEmail.Value,
                notification.Event.UserName.Value,
                CancellationToken.None
                ));

            return Task.CompletedTask;
        }
    }
}
