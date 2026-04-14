using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Interfaces.Services
{
    public interface IEmailService
    {
        Task SendOrderConfirmationAsync(int userID, int orderID, decimal totalPrice, CancellationToken cancellationToken = default);
        Task SendOrderCancelledAsync(int userID, int orderID, CancellationToken cancellationToken = default);
        Task SendPaymentSuccessBillEmailAsync(int userID, int orderID, decimal totalPrice, CancellationToken cancellationToken = default);
        Task SendOrderCompletedAsync(int userID, int orderID, string orderStatus, CancellationToken cancellationToken = default);
    }
}
