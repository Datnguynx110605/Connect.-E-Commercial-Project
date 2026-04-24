using Connect.Application.DTOs;
using Connect.Application.Interfaces.Services;
using Microsoft.AspNetCore.Http;
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
        private const string OrderIdPrefix = "ORDER:";

        private readonly IVnpayClient vnPayClient;
        private readonly ILogger<PaymentGateway> logger;
        public PaymentGateway(IVnpayClient _vnPayClient, ILogger<PaymentGateway> _logger)
        {
            vnPayClient = _vnPayClient;
            logger = _logger;
        }

        public string CreatePaymentUrl(int orderId, decimal amount)
        {
            var request = new VnpayPaymentRequest
            {
                Money = (double)amount,
                Description = $"{OrderIdPrefix}{orderId}".Trim(),
                BankCode = BankCode.ANY
            };

            var detail = vnPayClient.CreatePaymentUrl(request);
            logger.LogDebug("VNPay URL created. OrderId={OrderId}", orderId);

            return detail.Url;
        }

        public PaymentDto ParseCallback(HttpRequest request)
        {

            var result = vnPayClient.GetPaymentResult(request.Query);

            var description = result.Description ?? string.Empty;
            if (!description.StartsWith(OrderIdPrefix) || !int.TryParse(description[OrderIdPrefix.Length..], out int orderId))
            {
                throw new InvalidOperationException($"Cannot resolve OrderID from VNPay description: '{description}'");
            }

            return new PaymentDto
            {
                PaymentID=result.PaymentId,
                OrderID=orderId,
                PaymentType=result.CardType,
                TransactionID=result.VnpayTransactionId,
                BankingInfo=result.BankingInfor.BankCode,
                TotalAmount = decimal.Parse(request.Query["vnp_Amount"]) / 100,
                IsPaidSuccess=true,
                PaidAt=result.Timestamp
            };
        }
    }
}
