using Connect.Application.Interfaces.Persistences;
using Connect.Application.Interfaces.Services;
using Connect.Domain.Core.ValueObjects;
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
            var body = BuildOrderConfirmationHtml(user.UserName.Value, order.OrderID, order.OrderFinalPrice.Value, order.OrderShippingMethod.ToString(), order.OrderPaymentMethod.ToString());
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
            var body = BuildPaymentSuccessBillHtml(user.UserName.Value, order.OrderID, order.OrderFinalPrice.Value, order.OrderPaymentStatus.ToString());
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

        public async Task SendWelcomeEmailAsync(string email, string userName, CancellationToken cancellationToken = default)
        {
            Email userEmail = Email.Create(email);
            var user = await unitOfWork.Users.FirstOrDefaultNoTrackingAsync(x=> x.Email == userEmail, cancellationToken);
            if (user is null)
            {
                _logger.LogWarning("Cannot find Email {UserID} to send welcome email for User #{UserID}", userEmail, userName);
                return;
            }

            var subject = $"Welcome to Connect. - {userName} | Connect. ";
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
            <body style="margin:0;padding:0;background:#f4f4f0;font-family:'Segoe UI',Arial,sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f0;padding:48px 16px;">
                <tr><td align="center">
                  <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e8e8e3;">

                    <!-- Header -->
                    <tr>
                      <td style="background:#1a1a1a;padding:28px 40px;border-radius:12px 12px 0 0;">
                        <p style="margin:0;color:#ffffff;font-size:20px;font-weight:600;letter-spacing:-0.3px;">Connect.</p>
                      </td>
                    </tr>

                    <!-- Status badge -->
                    <tr>
                      <td style="background:#f0faf4;padding:24px 40px;border-bottom:1px solid #d4eddc;">
                        <table cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="background:#22863a;border-radius:20px;padding:5px 14px;">
                              <p style="margin:0;color:#ffffff;font-size:12px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;">Order confirmed</p>
                            </td>
                          </tr>
                        </table>
                        <p style="margin:12px 0 0;font-size:22px;font-weight:600;color:#1a1a1a;">Your order is placed!</p>
                        <p style="margin:6px 0 0;font-size:15px;color:#5f5e5a;line-height:1.5;">Hi <strong style="color:#1a1a1a;">{userName}</strong>, we've received your order and it's being prepared.</p>
                      </td>
                    </tr>

                    <!-- Order details -->
                    <tr>
                      <td style="padding:32px 40px;">
                        <p style="margin:0 0 16px;font-size:13px;font-weight:600;color:#888780;letter-spacing:0.6px;text-transform:uppercase;">Order summary</p>
                        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8e8e3;border-radius:8px;overflow:hidden;">
                          <tr style="background:#f9f9f7;">
                            <td style="padding:12px 16px;font-size:13px;color:#5f5e5a;border-bottom:1px solid #e8e8e3;">Order ID</td>
                            <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#1a1a1a;text-align:right;border-bottom:1px solid #e8e8e3;">#{orderID}</td>
                          </tr>
                          <tr>
                            <td style="padding:12px 16px;font-size:13px;color:#5f5e5a;border-bottom:1px solid #e8e8e3;">Shipping method</td>
                            <td style="padding:12px 16px;font-size:13px;color:#1a1a1a;text-align:right;border-bottom:1px solid #e8e8e3;">{shipMethod}</td>
                          </tr>
                          <tr style="background:#f9f9f7;">
                            <td style="padding:12px 16px;font-size:13px;color:#5f5e5a;border-bottom:1px solid #e8e8e3;">Payment method</td>
                            <td style="padding:12px 16px;font-size:13px;color:#1a1a1a;text-align:right;border-bottom:1px solid #e8e8e3;">{payMethod}</td>
                          </tr>
                          <tr>
                            <td style="padding:14px 16px;font-size:14px;font-weight:600;color:#1a1a1a;">Total</td>
                            <td style="padding:14px 16px;font-size:16px;font-weight:700;color:#22863a;text-align:right;">{totalPrice:N0} ₫</td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Info note -->
                    <tr>
                      <td style="padding:0 40px 32px;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f7;border-radius:8px;border-left:3px solid #1a1a1a;">
                          <tr>
                            <td style="padding:14px 16px;font-size:13px;color:#5f5e5a;line-height:1.5;">
                              You'll receive another email when your order has been shipped. You can track your order status in your account.
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background:#f9f9f7;padding:20px 40px;border-top:1px solid #e8e8e3;border-radius:0 0 12px 12px;">
                        <p style="margin:0;font-size:12px;color:#888780;">© Connect. · Questions? Reply to this email.</p>
                      </td>
                    </tr>

                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """;

        private static string BuildOrderCancelledHtml(string userName, int orderID, string orderStatus) =>
                    $"""
            <html>
            <body style="margin:0;padding:0;background:#f4f4f0;font-family:'Segoe UI',Arial,sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f0;padding:48px 16px;">
                <tr><td align="center">
                  <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e8e8e3;">

                    <!-- Header -->
                    <tr>
                      <td style="background:#1a1a1a;padding:28px 40px;border-radius:12px 12px 0 0;">
                        <p style="margin:0;color:#ffffff;font-size:20px;font-weight:600;letter-spacing:-0.3px;">Connect.</p>
                      </td>
                    </tr>

                    <!-- Status badge -->
                    <tr>
                      <td style="background:#fef6f6;padding:24px 40px;border-bottom:1px solid #fad4d4;">
                        <table cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="background:#c0392b;border-radius:20px;padding:5px 14px;">
                              <p style="margin:0;color:#ffffff;font-size:12px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;">Order cancelled</p>
                            </td>
                          </tr>
                        </table>
                        <p style="margin:12px 0 0;font-size:22px;font-weight:600;color:#1a1a1a;">Your order has been cancelled</p>
                        <p style="margin:6px 0 0;font-size:15px;color:#5f5e5a;line-height:1.5;">Hi <strong style="color:#1a1a1a;">{userName}</strong>, we're confirming your cancellation request.</p>
                      </td>
                    </tr>

                    <!-- Order details -->
                    <tr>
                      <td style="padding:32px 40px;">
                        <p style="margin:0 0 16px;font-size:13px;font-weight:600;color:#888780;letter-spacing:0.6px;text-transform:uppercase;">Cancellation details</p>
                        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8e8e3;border-radius:8px;overflow:hidden;">
                          <tr style="background:#f9f9f7;">
                            <td style="padding:12px 16px;font-size:13px;color:#5f5e5a;border-bottom:1px solid #e8e8e3;">Order ID</td>
                            <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#1a1a1a;text-align:right;border-bottom:1px solid #e8e8e3;">#{orderID}</td>
                          </tr>
                          <tr>
                            <td style="padding:12px 16px;font-size:13px;color:#5f5e5a;">Status</td>
                            <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#c0392b;text-align:right;">{orderStatus}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Support note -->
                    <tr>
                      <td style="padding:0 40px 32px;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f7;border-radius:8px;border-left:3px solid #c0392b;">
                          <tr>
                            <td style="padding:14px 16px;font-size:13px;color:#5f5e5a;line-height:1.5;">
                              If this cancellation was a mistake or you have questions, please contact our support team and we'll do our best to help.
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background:#f9f9f7;padding:20px 40px;border-top:1px solid #e8e8e3;border-radius:0 0 12px 12px;">
                        <p style="margin:0;font-size:12px;color:#888780;">© Connect. · Questions? Reply to this email.</p>
                      </td>
                    </tr>

                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """;

        private static string BuildPaymentSuccessBillHtml(string userName, int orderID, decimal totalPrice, string payStatus) =>
                    $"""
            <html>
            <body style="margin:0;padding:0;background:#f4f4f0;font-family:'Segoe UI',Arial,sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f0;padding:48px 16px;">
                <tr><td align="center">
                  <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e8e8e3;">

                    <!-- Header -->
                    <tr>
                      <td style="background:#1a1a1a;padding:28px 40px;border-radius:12px 12px 0 0;">
                        <p style="margin:0;color:#ffffff;font-size:20px;font-weight:600;letter-spacing:-0.3px;">Connect.</p>
                      </td>
                    </tr>

                    <!-- Status badge -->
                    <tr>
                      <td style="background:#f0faf4;padding:24px 40px;border-bottom:1px solid #d4eddc;">
                        <table cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="background:#22863a;border-radius:20px;padding:5px 14px;">
                              <p style="margin:0;color:#ffffff;font-size:12px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;">Payment received</p>
                            </td>
                          </tr>
                        </table>
                        <p style="margin:12px 0 0;font-size:22px;font-weight:600;color:#1a1a1a;">Payment successful</p>
                        <p style="margin:6px 0 0;font-size:15px;color:#5f5e5a;line-height:1.5;">Hi <strong style="color:#1a1a1a;">{userName}</strong>, your payment has been processed. Here's your receipt.</p>
                      </td>
                    </tr>

                    <!-- Receipt -->
                    <tr>
                      <td style="padding:32px 40px;">
                        <p style="margin:0 0 16px;font-size:13px;font-weight:600;color:#888780;letter-spacing:0.6px;text-transform:uppercase;">Payment receipt</p>
                        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8e8e3;border-radius:8px;overflow:hidden;">
                          <tr style="background:#f9f9f7;">
                            <td style="padding:12px 16px;font-size:13px;color:#5f5e5a;border-bottom:1px solid #e8e8e3;">Order ID</td>
                            <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#1a1a1a;text-align:right;border-bottom:1px solid #e8e8e3;">#{orderID}</td>
                          </tr>
                          <tr>
                            <td style="padding:12px 16px;font-size:13px;color:#5f5e5a;border-bottom:1px solid #e8e8e3;">Payment status</td>
                            <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#22863a;text-align:right;border-bottom:1px solid #e8e8e3;">{payStatus}</td>
                          </tr>
                          <tr style="background:#f9f9f7;">
                            <td style="padding:14px 16px;font-size:14px;font-weight:600;color:#1a1a1a;">Total paid</td>
                            <td style="padding:14px 16px;font-size:18px;font-weight:700;color:#22863a;text-align:right;">{totalPrice:N0} ₫</td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Note -->
                    <tr>
                      <td style="padding:0 40px 32px;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f7;border-radius:8px;border-left:3px solid #1a1a1a;">
                          <tr>
                            <td style="padding:14px 16px;font-size:13px;color:#5f5e5a;line-height:1.5;">
                              Thank you for your purchase. Your order is now being processed and will be shipped soon.
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background:#f9f9f7;padding:20px 40px;border-top:1px solid #e8e8e3;border-radius:0 0 12px 12px;">
                        <p style="margin:0;font-size:12px;color:#888780;">© Connect. · Keep this email as your payment receipt.</p>
                      </td>
                    </tr>

                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """;

        private static string BuildOrderCompletedHtml(string userName, int orderID, string orderStatus) =>
                    $"""
            <html>
            <body style="margin:0;padding:0;background:#f4f4f0;font-family:'Segoe UI',Arial,sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f0;padding:48px 16px;">
                <tr><td align="center">
                  <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e8e8e3;">

                    <!-- Header -->
                    <tr>
                      <td style="background:#1a1a1a;padding:28px 40px;border-radius:12px 12px 0 0;">
                        <p style="margin:0;color:#ffffff;font-size:20px;font-weight:600;letter-spacing:-0.3px;">Connect.</p>
                      </td>
                    </tr>

                    <!-- Status badge -->
                    <tr>
                      <td style="background:#f0faf4;padding:24px 40px;border-bottom:1px solid #d4eddc;">
                        <table cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="background:#22863a;border-radius:20px;padding:5px 14px;">
                              <p style="margin:0;color:#ffffff;font-size:12px;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;">Order completed</p>
                            </td>
                          </tr>
                        </table>
                        <p style="margin:12px 0 0;font-size:22px;font-weight:600;color:#1a1a1a;">Your order is complete</p>
                        <p style="margin:6px 0 0;font-size:15px;color:#5f5e5a;line-height:1.5;">Hi <strong style="color:#1a1a1a;">{userName}</strong>, thank you for shopping with us.</p>
                      </td>
                    </tr>

                    <!-- Order details -->
                    <tr>
                      <td style="padding:32px 40px;">
                        <p style="margin:0 0 16px;font-size:13px;font-weight:600;color:#888780;letter-spacing:0.6px;text-transform:uppercase;">Order details</p>
                        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8e8e3;border-radius:8px;overflow:hidden;">
                          <tr style="background:#f9f9f7;">
                            <td style="padding:12px 16px;font-size:13px;color:#5f5e5a;border-bottom:1px solid #e8e8e3;">Order ID</td>
                            <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#1a1a1a;text-align:right;border-bottom:1px solid #e8e8e3;">#{orderID}</td>
                          </tr>
                          <tr>
                            <td style="padding:12px 16px;font-size:13px;color:#5f5e5a;">Status</td>
                            <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#22863a;text-align:right;">{orderStatus}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- CTA -->
                    <tr>
                      <td style="padding:0 40px 32px;text-align:center;">
                        <p style="margin:0 0 16px;font-size:14px;color:#5f5e5a;">Enjoyed your experience? We'd love to hear your thoughts.</p>
                        <a href="#" style="display:inline-block;padding:13px 28px;background:#1a1a1a;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:500;">Leave a review</a>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background:#f9f9f7;padding:20px 40px;border-top:1px solid #e8e8e3;border-radius:0 0 12px 12px;">
                        <p style="margin:0;font-size:12px;color:#888780;">© Connect. · It's been a pleasure having you.</p>
                      </td>
                    </tr>

                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """;

        private static string BuildEmailVerificationHtml(string verificationUrl) =>
                    $"""
            <html>
            <body style="margin:0;padding:0;background:#f4f4f0;font-family:'Segoe UI',Arial,sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f0;padding:48px 16px;">
                <tr><td align="center">
                  <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e8e8e3;">

                    <!-- Header -->
                    <tr>
                      <td style="background:#1a1a1a;padding:28px 40px;border-radius:12px 12px 0 0;">
                        <p style="margin:0;color:#ffffff;font-size:20px;font-weight:600;letter-spacing:-0.3px;">Connect.</p>
                      </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                      <td style="padding:40px;">
                        <p style="margin:0 0 8px;font-size:22px;font-weight:600;color:#1a1a1a;">Verify your email address</p>
                        <p style="margin:0 0 32px;font-size:15px;line-height:1.6;color:#5f5e5a;">
                          To complete your registration, click the button below. This link expires in <strong style="color:#1a1a1a;">30 minutes</strong>.
                        </p>

                        <table cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="border-radius:8px;background:#1a1a1a;">
                              <a href="{verificationUrl}" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:500;border-radius:8px;">
                                Verify email address
                              </a>
                            </td>
                          </tr>
                        </table>

                        <p style="margin:32px 0 0;font-size:13px;color:#888780;line-height:1.5;">
                          Or copy and paste this link into your browser:<br>
                          <span style="color:#5f5e5a;font-size:12px;">{verificationUrl}</span>
                        </p>
                      </td>
                    </tr>

                    <!-- Divider + note -->
                    <tr>
                      <td style="padding:0 40px 32px;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f7;border-radius:8px;border-left:3px solid #888780;">
                          <tr>
                            <td style="padding:14px 16px;font-size:13px;color:#5f5e5a;line-height:1.5;">
                              If you didn't create a Connect. account, you can safely ignore this email. Someone may have entered your email address by mistake.
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background:#f9f9f7;padding:20px 40px;border-top:1px solid #e8e8e3;border-radius:0 0 12px 12px;">
                        <p style="margin:0;font-size:12px;color:#888780;">© Connect. · This link expires in 30 minutes.</p>
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
            <body style="margin:0;padding:0;background:#f4f4f0;font-family:'Segoe UI',Arial,sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f0;padding:48px 16px;">
                <tr><td align="center">
                  <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e8e8e3;">

                    <!-- Header -->
                    <tr>
                      <td style="background:#1a1a1a;padding:28px 40px;border-radius:12px 12px 0 0;">
                        <p style="margin:0;color:#ffffff;font-size:20px;font-weight:600;letter-spacing:-0.3px;">Connect.</p>
                      </td>
                    </tr>

                    <!-- Welcome body -->
                    <tr>
                      <td style="padding:40px;">
                        <p style="margin:0 0 8px;font-size:22px;font-weight:600;color:#1a1a1a;">Welcome, {userName}.</p>
                        <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#5f5e5a;">
                          Your account is ready. Browse thousands of products, track your orders, and enjoy a seamless shopping experience — all in one place.
                        </p>

                        <table cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="border-radius:8px;background:#1a1a1a;">
                              <a href="#" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:500;border-radius:8px;">
                                Start shopping
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- What's next -->
                    <tr>
                      <td style="padding:0 40px 32px;">
                        <p style="margin:0 0 16px;font-size:13px;font-weight:600;color:#888780;letter-spacing:0.6px;text-transform:uppercase;">What you can do</p>
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding:10px 0;border-bottom:1px solid #e8e8e3;font-size:14px;color:#1a1a1a;">Browse &amp; filter thousands of products</td>
                          </tr>
                          <tr>
                            <td style="padding:10px 0;border-bottom:1px solid #e8e8e3;font-size:14px;color:#1a1a1a;">Track your orders in real time</td>
                          </tr>
                          <tr>
                            <td style="padding:10px 0;font-size:14px;color:#1a1a1a;">Use discount codes at checkout</td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background:#f9f9f7;padding:20px 40px;border-top:1px solid #e8e8e3;border-radius:0 0 12px 12px;">
                        <p style="margin:0;font-size:12px;color:#888780;">© Connect. · Thanks for joining us.</p>
                      </td>
                    </tr>

                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """;
    }
}

