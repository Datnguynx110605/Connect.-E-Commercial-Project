using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Interfaces.Services
{
    public interface INotificationService
    {
        Task NotifyNewUserRegistered(string userName, string email, CancellationToken cancellationToken);
        Task NotifyLowStockAsync(int productID, string productName, int remaining, CancellationToken cancellationToken);
        Task NotifyOrderPlacedAsync(int orderID, int userID, string shippingMethod, string payMethod, decimal totalPrice, CancellationToken cancellationToken);
        Task NotifyOrderCancelledAsync(int orderID, int userID, string orderStatus, CancellationToken cancellationToken);
        Task NotifyPaymentCompletedAsync(int userID, int orderID, string payMethod, decimal totalAmount, CancellationToken cancellationToken);
    }
}
