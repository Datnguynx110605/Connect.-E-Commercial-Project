using Connect.Application.DTOs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using System.Text.RegularExpressions;

namespace Connect.Infrastructure.Hub
{
    public interface INotificationClient
    {
        Task ReceiveNotification(NotificationDto notification);
    }

    public sealed class NotificationHub : Hub<INotificationClient>
    {
        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst("sub")?.Value;
            var role = Context.User?.FindFirst("role")?.Value;

            if (userId != null)
                await Groups.AddToGroupAsync(Context.ConnectionId, $"user-{userId}");

            if (role == "Admin")
                await Groups.AddToGroupAsync(Context.ConnectionId, "admins");

            await base.OnConnectedAsync();
        }
    }
}
