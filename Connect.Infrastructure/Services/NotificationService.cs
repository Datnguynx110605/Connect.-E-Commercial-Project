using Connect.Application.DTOs;
using Connect.Application.Interfaces.Services;
using Connect.Domain.Core.Entities;
using Connect.Infrastructure.Hub;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Infrastructure.Services
{
    public sealed class NotificationService(IHubContext<NotificationHub, INotificationClient> hub) : INotificationService
    {
        private const string AdminGroup = "admins";
        public Task NotifyLowStockAsync(int productID, string productName, int remaining, CancellationToken cancellationToken) =>
            hub.Clients.Group(AdminGroup).ReceiveNotification(new NotificationDto(
            Id: Guid.NewGuid().ToString(),
            Type: "low_stock",
            Title: "Low stock warning",
            Body: $"{productName} has {remaining} units remaining.",
            CreatedAt: DateTime.UtcNow
                ));

        public Task NotifyOrderCancelledAsync(int orderID, int userID, string orderStatus, CancellationToken cancellationToken) =>
            hub.Clients.Group(AdminGroup).ReceiveNotification(new NotificationDto(
            Id: Guid.NewGuid().ToString(),
            Type: "order_cancelled",
            Title: "Order cancelled",
            Body: $"Order : {orderID} by User : {userID} was cancelled. - Order status: {orderStatus}",
            CreatedAt: DateTime.UtcNow
                ));

        public Task NotifyOrderPlacedAsync(int orderID, int userID, string shippingMethod, string payMethod, decimal totalPrice, CancellationToken cancellationToken) =>
            hub.Clients.Group(AdminGroup).ReceiveNotification(new NotificationDto(
            Id: Guid.NewGuid().ToString(),
            Type: "order_placed",
            Title: "New order received",
            Body: $"Order : {orderID} was placed from User : {userID} — Shipping method : {shippingMethod} - Payment method : {payMethod} - Total amount of money: {totalPrice}",
            CreatedAt: DateTime.UtcNow
                ));

        public Task NotifyPaymentCompletedAsync(int userID, int orderID, string payMethod, decimal totalAmount, CancellationToken cancellationToken) =>
            hub.Clients.Group(AdminGroup).ReceiveNotification(new NotificationDto(
                Id: Guid.NewGuid().ToString(),
                Type: "payment_success",
                Title:"Payment successfully",
                Body: $"User {userID} paid succesfully Order {orderID} -  payment method : {payMethod} - total amount of money : {totalAmount}",
                CreatedAt: DateTime.UtcNow
                ));
        }
}
