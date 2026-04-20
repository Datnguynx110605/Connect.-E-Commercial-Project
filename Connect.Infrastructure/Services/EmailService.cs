using Connect.Application.Interfaces.Persistences;
using Connect.Application.Interfaces.Services;
using Connect.Infrastructure.Persistences;
using Connect.Infrastructure.Settings;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Infrastructure.Services
{
    internal sealed class EmailService:IEmailService
    {
        private readonly EmailSettings _settings;
        private readonly ILogger<EmailService> _logger;
        private readonly IUnitOfWork unitOfWork;
        public EmailService(IOptions<EmailSettings> settings, ILogger<EmailService> logger, IUnitOfWork _unitOfWork)
        {
            _settings = settings.Value;
            _logger = logger;
            unitOfWork = _unitOfWork;
        }

        public async Task SendOrderConfirmationAsync(int userID,int orderID, decimal totalPrice, string shipMethpd, string payMethod, CancellationToken cancellationToken = default)
        {
            var user = await unitOfWork.Users.GetByIdAsync(userID, cancellationToken);
            if (user == null)
            {
                _logger.LogWarning("Can't find User {UserID} to send confirmed email #{OrderID}", userID, orderID);
                return;
            }

            var order = await unitOfWork.Orders.GetByIdAsync(orderID, cancellationToken);
            if (order is null)
            {
                _logger.LogWarning("Cannot find Order #{OrderID} to send payment bill email for User {UserID}", orderID, userID);
                return;
            }

            var subject = $"Order Confirmation #{orderID} — Connect.";
            var body = BuildOrderConfirmationHtml(user.UserName.Value, order.OrderID, order.OrderTotalPrice.Value, order.OrderShippingMethod.ToString(), order.OrderPaymentMethod.ToString());
            await SendAsync(user.Email.Value, subject, body, cancellationToken);
        }

        public async Task SendOrderCancelledAsync(int userID, int orderID, string orderStatus, CancellationToken cancellationToken = default)
        {
            var user = await unitOfWork.Users.GetByIdAsync(userID, cancellationToken);
            if (user is null)
            {
                _logger.LogWarning("Cannot find User {UserID} to send cancellation email for Order #{OrderID}", userID, orderID);
                return;
            }

            var order = await unitOfWork.Orders.GetByIdAsync(orderID, cancellationToken);
            if (order is null)
            {
                _logger.LogWarning("Cannot find Order #{OrderID} to send cancel confirmation email for User {UserID}", orderID, userID);
                return;
            }

            var subject = $"Order Cancelled #{orderID} | Connect.";
            var body = BuildOrderCancelledHtml(user.UserName.Value, order.OrderID, order.OrderStatus.ToString());
            await SendAsync(user.Email.Value, subject, body, cancellationToken);
        }

        public async Task SendPaymentSuccessBillEmailAsync(int userID, int orderID, decimal totalPrice, string payStatus, CancellationToken cancellationToken = default)
        {
            var user = await unitOfWork.Users.GetByIdAsync(userID, cancellationToken);
            if (user is null)
            {
                _logger.LogWarning("Cannot find User {UserID} to send payment bill email for Order #{OrderID}", userID, orderID);
                return;
            }

            var order = await unitOfWork.Orders.GetByIdAsync(orderID, cancellationToken);
            if (order is null)
            {
                _logger.LogWarning("Cannot find Order #{OrderID} to send payment bill email for User {UserID}", orderID, userID);
                return;
            }

            var subject = $"Payment Successful — Order #{orderID} | Connect.";
            var body = BuildPaymentSuccessBillHtml(user.UserName.Value, order.OrderID, order.OrderTotalPrice.Value, order.OrderPaymentStatus.ToString());
            await SendAsync(user.Email.Value, subject, body, cancellationToken);
        }

        public async Task SendOrderCompletedAsync(int userID, int orderID, string orderStatus, CancellationToken cancellationToken=default)
        {
            var user = await unitOfWork.Users.GetByIdAsync(userID, cancellationToken);
            if (user is null)
            {
                _logger.LogWarning("Cannot find User {UserID} to send order completed email for Order #{OrderID}", userID, orderID);
                return;
            }

            var order = await unitOfWork.Orders.GetByIdAsync(orderID, cancellationToken);
            if (order is null)
            {
                _logger.LogWarning("Cannot find Order #{OrderID} to send order completed email for User {UserID}", orderID, userID);
                return;
            }

            var subject = $"Order is completed - Order #{orderID} | Connect.";
            var body = BuildOrderCompletedHtml(user.UserName.Value, order.OrderID, order.OrderStatus.ToString());
            await SendAsync(user.Email.Value, subject, body, cancellationToken);
        }

        public async Task SendEmailVerificationAsync(string toEmail, string verificationUrl, CancellationToken cancellationToken = default)
        {
            var subject = "Verify your email — Connect.";
            var body = BuildEmailVerificationHtml(verificationUrl);
            await SendAsync(toEmail, subject, body, cancellationToken);
        }

        public async Task SendWelcomeEmailAsync(int userID, string userName, CancellationToken cancellationToken = default)
        {
            var user = await unitOfWork.Users.GetByIdAsync(userID, cancellationToken);
            if (user is null)
            {
                _logger.LogWarning("Cannot find User {UserID} to send welcome email for User #{UserID}", userID, userName);
                return;
            }

            var subject = $"Welcome to Connect. - User #{userName} | Connect. ";
            var body = BuildWelcomeHtml(user.UserName.Value);
            await SendAsync(user.Email.Value, subject, body, cancellationToken);
        }

        private async Task SendAsync(string toEmail, string subject, string htmlBody, CancellationToken cancellationToken)
        {
            try
            {
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(_settings.FromName, _settings.Username));
                message.To.Add(MailboxAddress.Parse(toEmail));
                message.Subject = subject;

                var bodyBuilder = new BodyBuilder { HtmlBody = htmlBody };
                message.Body = bodyBuilder.ToMessageBody();

                using var client = new SmtpClient();
                await client.ConnectAsync(_settings.Host, _settings.Port, SecureSocketOptions.StartTls, cancellationToken);

                await client.AuthenticateAsync(_settings.Username, _settings.Password, cancellationToken);

                await client.SendAsync(message, cancellationToken);
                await client.DisconnectAsync(quit: true, cancellationToken);

                _logger.LogInformation("Email sent successfully to {Email} | Subject: {Subject}", toEmail, subject);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,"Failed to send email to {Email} | Subject: {Subject}", toEmail, subject);
                throw;
            }
        }

        private static string BuildOrderConfirmationHtml(string userName, int orderID, decimal totalPrice, string shipMethod, string payMethod) =>
            $"""
            <html>
            <body style="font-family: Arial, sans-serif; color: #333;">
                <h2 style="color: #4CAF50;">Order Confirmed!</h2>
                <p>Hi <strong>{userName}</strong>,</p>
                <p>Thank you for your order. Here are your order details:</p>
                <table style="border-collapse: collapse; width: 100%;">
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Order ID</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">{orderID}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Total Price</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">{totalPrice:N0} VND</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Shipping Method</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">{shipMethod}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Payment Method</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">{payMethod}</td>
                    </tr>
                </table>
                <p style="margin-top: 20px;">We'll notify you once your order is shipped.</p>
                <p>— The Connect. Team</p>
            </body>
            </html>
            """;

        private static string BuildOrderCancelledHtml(string userName, int orderID, string orderStatus) =>
            $"""
            <html>
            <body style="font-family: Arial, sans-serif; color: #333;">
                <h2 style="color: #E53935;">Order Cancelled</h2>
                <p>Hi <strong>{userName}</strong>,</p>
                <p>Your order has been cancelled.</p>
                <table style="border-collapse: collapse; width: 100%;">
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Order ID</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">{orderID}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Status</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">{orderStatus}</td>
                    </tr>
                </table>
                <p style="margin-top: 20px;">If you believe this is a mistake or have any questions, please contact our support team.</p>
                <p>— The Connect. Team</p>
            </body>
            </html>
            """;

        private static string BuildPaymentSuccessBillHtml(string userName, int orderID, decimal totalPrice, string payStatus) =>
            $"""
            <html>
            <body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto;">
                <h2 style="color: #1976D2;">Payment Successful 🎉</h2>
                <p>Hi <strong>{userName}</strong>,</p>
                <p>We've received your payment. Here is your bill summary:</p>
                <table style="border-collapse: collapse; width: 100%; margin-top: 12px;">
                    <tr style="background-color: #f5f5f5;">
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Order ID</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd;">{orderID}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Payment Status</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd; color: #2E7D32;"><strong>{payStatus}</strong></td>
                    </tr>
                    <tr style="background-color: #f5f5f5;">
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Total Amount</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>{totalPrice:N0} VND</strong></td>
                    </tr>
                </table>
                <p style="margin-top: 20px;">Thank you for shopping with us. Your order is now being processed.</p>
                <p>— The Connect. Team</p>
            </body>
            </html>
            """;

        private static string BuildOrderCompletedHtml(string userName, int orderID, string orderStatus) =>
            $"""
            <html>
            <body style="font-family: Arial, sans-serif; color: #333;">
                <h2 style="color: #4CAF50;">Order Completed!</h2>
                <p>Hi <strong>{userName}</strong>,</p>
                <p>Thank you for your order. Here are your order details:</p>
                <table style="border-collapse: collapse; width: 100%;">
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Order ID</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">{orderID}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Total Price</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">{orderStatus}</td>
                    </tr>
                </table>
                <p style="margin-top: 20px;">It is our honour to give our customer the best experience</p>
                <p>— The Connect. Team</p>
            </body>
            </html>
            """;

        private static string BuildEmailVerificationHtml(string verificationUrl) =>
            $"""
            <html>
            <body style="margin:0;padding:0;background:#f9f9f7;font-family:sans-serif">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td align="center" style="padding:48px 16px">
                  <table width="560" cellpadding="0" cellspacing="0"
                         style="background:#ffffff;border-radius:12px;overflow:hidden">
                    <tr>
                      <td style="background:#1a1a1a;padding:32px 40px">
                        <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:500">
                          Connect.
                        </h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:40px">
                        <h2 style="margin:0 0 12px;font-size:20px;font-weight:500;color:#1a1a1a">
                          Verify your email address
                        </h2>
                        <p style="margin:0 0 32px;font-size:15px;line-height:1.6;color:#5f5e5a">
                          Click the button below to verify your email. 
                          This link expires in <strong>30 minutes</strong>.
                        </p>
                        <a href="{verificationUrl}"
                           style="display:inline-block;padding:14px 32px;
                                  background:#1a1a1a;color:#ffffff;
                                  text-decoration:none;border-radius:8px;
                                  font-size:15px;font-weight:500">
                          Verify email
                        </a>
                        <p style="margin:32px 0 0;font-size:13px;color:#888780">
                          If you didn't create an account, you can safely ignore this email.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """;

        private static string BuildWelcomeHtml(string userName) =>
           $"""
            <html>
            <body style="font-family: Arial, sans-serif; color: #333;">
                <h2 style="color: #4CAF50;">Welcome to Connect!</h2>
                <p>Hi <strong>{userName}</strong>,</p>
                <p>Thanks for choosing us</p>
                <p style="margin-top: 20px;">Let's grab something, init?</p>
                <p>— The Connect. Team</p>
            </body>
            </html>
            """;
    }
}

