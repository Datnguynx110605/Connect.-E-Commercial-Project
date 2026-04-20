using Connect.Application.Commons;
using Connect.Application.Interfaces.Services;
using Connect.Domain.Events.OrderEvents;
using Hangfire;
using MediatR;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Orders.Commands.CancelOrder
{
    internal sealed class CancelledOrderEventHandler : INotificationHandler<DomainEventNotification<OrderCancelledEvent>>
    {
        private readonly IBackgroundJobClient backgroundJobClient;
        private readonly ILogger<CancelledOrderEventHandler> logger;

        public CancelledOrderEventHandler(IBackgroundJobClient _backgroundJobClient, ILogger<CancelledOrderEventHandler> _logger)
        {
            backgroundJobClient = _backgroundJobClient;
            logger = _logger;
        }

        public Task Handle(DomainEventNotification<OrderCancelledEvent> notification, CancellationToken cancellationToken)
        {
            logger.LogInformation("Handling OrderCancelledEvent for User {UserID}", notification.Event.Order);

            backgroundJobClient.Enqueue<IEmailService>(emailService => emailService.SendOrderCancelledAsync(
                notification.Event.Order.UserID,
                notification.Event.Order.OrderID,
                notification.Event.Order.OrderStatus.ToString(),
                CancellationToken.None));

            return Task.CompletedTask;
        }
    }
}
