using Connect.Application.Commons;
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
    internal sealed class UserRegisteredEventHandler : INotificationHandler<DomainEventNotification<UserRegisterEvent>>
    {
        private readonly IBackgroundJobClient backgroundJobClient;
        private readonly ILogger<UserRegisteredEventHandler> logger;
        public UserRegisteredEventHandler(IBackgroundJobClient _backgroundJobClient, ILogger<UserRegisteredEventHandler> _logger)
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

            backgroundJobClient.Enqueue<INotificationService>(notificationService => notificationService.NotifyNewUserRegistered(
                notification.Event.UserName.Value,
                notification.Event.UserEmail.Value,
                CancellationToken.None
                ));

            return Task.CompletedTask;
        }
    }
}
