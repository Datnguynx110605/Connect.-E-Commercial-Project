using Connect.Application.Interfaces.Services;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text;
using VNPAY;
using VNPAY.Models;
using VNPAY.Models.Enums;

namespace Connect.Infrastructure.Services
{
    public sealed class PaymentGateway:IPaymentGateway
    {
        private readonly IVnpayClient vnPayClient;
        private readonly ILogger<PaymentGateway> logger;
        public PaymentGateway(IVnpayClient _vnPayClient, ILogger<PaymentGateway> _logger)
        {
            vnPayClient = _vnPayClient;
            logger = _logger;
        }

        public string CreatePaymentUrl(int orderId, decimal amount, string description)
        {
            var request = new VnpayPaymentRequest
            {
                Money = (double)amount,
                Description = description,
                BankCode= BankCode.ANY
            };

            var detail = vnPayClient.CreatePaymentUrl(request);
            logger.LogInformation("VNPay URL created. PaymentId={PaymentId}, OrderId={OrderId}", detail.PaymentId, orderId);

            return detail.Url;
        }
    }
}
