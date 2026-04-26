using Connect.Application.Commons;
using Connect.Application.Interfaces.Services;
using Connect.Domain.Events.OrderEvents;
using Hangfire;
using MediatR;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Orders.Commands.CreateOrder
{
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
            logger.LogInformation("Take event OrderPlaced for order #{OrderId}. Waiting to send email...", notification.Event.Order);

            backgroundJobClient.Enqueue<IEmailService>(emailService => emailService.SendOrderConfirmationAsync(
                notification.Event.Order.UserID,
                notification.Event.Order.OrderID,
                notification.Event.Order.OrderFinalPrice.Value,
                notification.Event.Order.OrderShippingMethod.ToString(),
                notification.Event.Order.OrderPaymentMethod.ToString(),
                CancellationToken.None));

            backgroundJobClient.Enqueue<INotificationService>(notficationService => notficationService.NotifyOrderPlacedAsync(
                notification.Event.Order.OrderID,
                notification.Event.Order.UserID,
                notification.Event.Order.OrderShippingMethod.ToString(),
                notification.Event.Order.OrderPaymentMethod.ToString(),
                notification.Event.Order.OrderFinalPrice.Value,
                CancellationToken.None));

            return Task.CompletedTask;
        }
    }
}
