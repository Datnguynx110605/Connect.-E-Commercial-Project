using Connect.Application.Commons.DTOs;
using Connect.Application.Interfaces.Services;
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

        public Task NotifyNewUserRegistered(string userName, string email, CancellationToken cancellationToken) =>
            hub.Clients.Group(AdminGroup).ReceiveNotification(new NotificationDto(
            Id: Guid.NewGuid().ToString(),
            Type: "Nguời dùng mới đăng ký",
            Title: "Người dùng mới đăng ký tài khoản",
            Body:$"Người dùng mới đăng ký tài khoản với tên {userName} và email {email}",
            CreatedAt: DateTime.UtcNow
                ));
        public Task NotifyLowStockAsync(int productID, string productName, int remaining, CancellationToken cancellationToken) =>
            hub.Clients.Group(AdminGroup).ReceiveNotification(new NotificationDto(
            Id: Guid.NewGuid().ToString(),
            Type: "Sản lượng tồn kho thấp",
            Title: "Cảnh báo tồn kho sản phẩm sắp hết",
            Body: $"{productName} còn {remaining} sản phẩm",
            CreatedAt: DateTime.UtcNow
                ));

        public Task NotifyOrderCancelledAsync(int orderID, int userID, string orderStatus, CancellationToken cancellationToken) =>
            hub.Clients.Group(AdminGroup).ReceiveNotification(new NotificationDto(
            Id: Guid.NewGuid().ToString(),
            Type: "Đơn hàng bị hủy",
            Title: "Đơn hàng đã được hủy",
            Body: $"Đơn hàng {orderID} của {userID} đã được hủy | Trạng thái đơn hàng: {orderStatus}",
            CreatedAt: DateTime.UtcNow
                ));

        public Task NotifyOrderPlacedAsync(int orderID, int userID, string shippingMethod, string payMethod, decimal totalPrice, CancellationToken cancellationToken) =>
            hub.Clients.Group(AdminGroup).ReceiveNotification(new NotificationDto(
            Id: Guid.NewGuid().ToString(),
            Type: "Đơn hàng được đặt",
            Title: "Đơn hàng mới đã được đặt thành công",
            Body: $"Đơn hàng {orderID} đã được đặt bởi {userID} | Phương thức vận chuyển: {shippingMethod} | Phương thức thanh toán: {payMethod} | Tổng tiền: {totalPrice:NO} ₫",
            CreatedAt: DateTime.UtcNow
                ));

        public Task NotifyPaymentCompletedAsync(int userID, int orderID, string payMethod, decimal totalAmount, CancellationToken cancellationToken) =>
            hub.Clients.Group(AdminGroup).ReceiveNotification(new NotificationDto(
                Id: Guid.NewGuid().ToString(),
                Type: "Thanh toán thành công",
                Title:"Đơn hàng đã thanh toán thành công",
                Body: $"Người dùng {userID} đã thanh toán thành công đơn hàng {orderID} |  Phương thức thanh toán: {payMethod} | Tổng tiền: {totalAmount:NO} ₫",
                CreatedAt: DateTime.UtcNow
                ));
        }
}
