using Connect.Application.Interfaces.Persistences;
using Connect.Application.Interfaces.Services;
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

        public async Task SendOrderConfirmationAsync(int userID,int orderID, decimal totalPrice, CancellationToken cancellationToken = default)
        {
            var user = await unitOfWork.Users.GetByIdAsync(userID, cancellationToken);
            if (user == null)
            {
                _logger.LogWarning("Can't find User {UserID} to send confirmed email #{OrderID}", userID, orderID);
                return;
            }

            var subject = $"Order Confirmation #{orderID} — Connect.";
            var body = BuildOrderConfirmationHtml(user.UserName.Value, orderID, totalPrice);
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

        private static string BuildOrderConfirmationHtml(string userName, int orderID, decimal totalPrice) =>
            $"""
            <html>
            <body style="font-family: Arial, sans-serif; color: #333;">
                <h2 style="color: #4CAF50;">Order Confirmed!</h2>
                <p>Hi <strong>{userName}</strong>,</p>
                <p>Thank you for your order. Here are your order details:</p>
                <table style="border-collapse: collapse; width: 100%;">
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Order ID</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">#{orderID}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; border: 1px solid #ddd;"><strong>Total Price</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">{totalPrice:N0} VND</td>
                    </tr>
                </table>
                <p style="margin-top: 20px;">We'll notify you once your order is shipped.</p>
                <p>— The Connect. Team</p>
            </body>
            </html>
            """;

        public async Task SendOtpEmailAsync(string userEmail, string otpCode, CancellationToken cancellationToken = default)
        {
            var user = await unitOfWork.Users.FirstOrDefaultNoTrackingAsync(x => x.Email.Value == userEmail, cancellationToken);
            if (user == null)
            {
                _logger.LogWarning("Can't find User with email {Email} to send OTP email", userEmail);
                return;
            }

            var subject = "Verify your Connect. account";
            var body = BuildOtpEmailHtml(user.UserName.Value, otpCode);
            await SendAsync(user.Email.Value, subject, body, cancellationToken);
        }

        private static string BuildOtpEmailHtml(string userName, string otpCode) =>
            $"""
            <html>
            <body style="font-family: Arial, sans-serif; color: #333;">
                <h2 style="color: #4CAF50;">Welcome to Connect.!</h2>
                <p>Hi <strong>{userName}</strong>,</p>
                <p>Thank you for registering. Use the OTP code below to verify your account:</p>
                <div style="margin: 24px 0; text-align: center;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4CAF50;">
                        {otpCode}
                    </span>
                </div>
                <p>This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
                <p>— The Connect. Team</p>
            </body>
            </html>
            """;
            }
}

