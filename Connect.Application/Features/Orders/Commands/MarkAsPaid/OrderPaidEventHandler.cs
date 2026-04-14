using Connect.Application.Commons;
using Connect.Application.Interfaces.Services;
using Connect.Domain.Events.OrderEvents;
using Hangfire;
using MediatR;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Orders.Commands.MarkAsPaid
{
    internal sealed class OrderPaidEventHandler : INotificationHandler<DomainEventNotification<OrderPaidEvent>>
    {
        private readonly IBackgroundJobClient backgroundJobClient;
        private readonly ILogger<OrderPaidEventHandler> logger;
        public OrderPaidEventHandler(IBackgroundJobClient _backgroundJobClient, ILogger<OrderPaidEventHandler> _logger)
        {
            backgroundJobClient = _backgroundJobClient;
            logger = _logger;
        }

        public Task Handle(DomainEventNotification<OrderPaidEvent> notification, CancellationToken cancellationToken)
        {
            logger.LogInformation("Handling OrderPaidEvent for User {UserID}", notification.Event.UserID);

            backgroundJobClient.Enqueue<IEmailService>(emailService => emailService.SendPaymentSuccessBillEmailAsync(
                notification.Event.UserID,
                notification.Event.OrderID,
                notification.Event.TotalAmount.Value,
                CancellationToken.None));

            return Task.CompletedTask;
        }
    }
}
