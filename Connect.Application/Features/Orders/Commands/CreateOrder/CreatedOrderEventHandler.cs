using Connect.Application.Interfaces.Services;
using Connect.Domain.Common;
using Connect.Domain.Events.OrderEvents;
using Hangfire;
using MediatR;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Orders.Commands.CreateOrder
{
    public record DomainEventNotification<T>(T Event) : INotification where T : DomainEvent;
    internal sealed class CreatedOrderEventHandler : INotificationHandler<DomainEventNotification<OrderPlacedEvent>>
    {
        private readonly IBackgroundJobClient backgroundJobClient;
        private readonly ILogger<CreatedOrderEventHandler> logger;
        public CreatedOrderEventHandler(IBackgroundJobClient _backgroundJobClient, ILogger<CreatedOrderEventHandler> _logger)
        {
            backgroundJobClient = _backgroundJobClient;
            logger = _logger;
        }

        public Task Handle(DomainEventNotification<OrderPlacedEvent> notification, CancellationToken cancellationToken)
        {
            logger.LogInformation("Take event OrderPlaced for order #{OrderId}. Waiting to send email...", notification.Event);

            backgroundJobClient.Enqueue<IEmailService>(emailService => emailService.SendOrderConfirmationAsync(
                notification.Event.UserID,
                notification.Event.OrderID,
                notification.Event.OrderTotalPrice.Value,
                CancellationToken.None));

            return Task.CompletedTask;
        }
    }
}
