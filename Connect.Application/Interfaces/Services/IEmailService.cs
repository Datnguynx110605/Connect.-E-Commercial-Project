using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Interfaces.Services
{
    public interface IEmailService
    {
        Task SendOrderConfirmationAsync(int userID, int orderID, decimal totalPrice, CancellationToken cancellationToken = default);
        Task SendOtpEmailAsync(string userEmail, string otpCode, CancellationToken cancellationToken = default);
    }
}
