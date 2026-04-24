using Connect.Application.Commons;
using Connect.Application.Interfaces.Services;
using Connect.Domain.Events.OrderEvents;
using Hangfire;
using MediatR;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Orders.Commands.UpdateOrderStatusToCompleted
{
    internal sealed class OrderCompletedEventHandler : INotificationHandler<DomainEventNotification<OrderCompletedEvent>>
    {
        private readonly IBackgroundJobClient backgroundJobClient;
        private readonly ILogger<OrderCompletedEventHandler> logger;
        public OrderCompletedEventHandler(IBackgroundJobClient _backgroundJobClient, ILogger<OrderCompletedEventHandler> _logger)
        {
            backgroundJobClient = _backgroundJobClient;
            logger = _logger;
        }

        public Task Handle(DomainEventNotification<OrderCompletedEvent> notification, CancellationToken cancellationToken)
        {
            logger.LogInformation("Handling OrderCompletedEvent for User {UserID}", notification.Event.UserID);

            backgroundJobClient.Enqueue<IEmailService>(emailService => emailService.SendOrderCompletedAsync(
                notification.Event.UserID,
                notification.Event.OrderID,
                notification.Event.OrderStatus.ToString(),
                CancellationToken.None));

            return Task.CompletedTask;
        }
    }
}
