using Connect.Application.Features.Payments.Commands.CreatePayment;
using Connect.Application.Features.Payments.Commands.ProcessPaymentCallback;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using VNPAY;
using VNPAY.Models.Exceptions;

namespace Connect.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentsController : APIController
    {
        private readonly IVnpayClient client;
        public PaymentsController(ISender sender, IVnpayClient _client) : base(sender)
        {
            client = _client;
        }

        [HttpPost("create-url")]
        [Authorize]
        public async Task<IActionResult> CreatePayment([FromBody] CreatePaymentCommand command, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command, cancellationToken);

            return result.IsSuccess
                ? Ok(new { PaymentUrl = result.Value })
                : NotFound(result.Errors);
        }

        [HttpGet("vnpay-callback")]
        public async Task<IActionResult> VnPayCallback(CancellationToken ct)
        {

            try
            {
                var paymentResult = client.GetPaymentResult(Request);
                var txnRef = Request.Query["vnp_TxnRef"].ToString();
                var vnpResponseCode = Request.Query["vnp_ResponseCode"].ToString();

                if (!int.TryParse(txnRef, out int orderId))
                    return Redirect("/payment/failed?code=InvalidOrderId");

                decimal.TryParse(Request.Query["vnp_Amount"], out decimal rawAmount);
                decimal actualAmount = rawAmount / 100;

                bool isSuccess = vnpResponseCode == "00";
                string? transactionId = null;
                transactionId = paymentResult.VnpayTransactionId.ToString();

                var command = new ProcessPaymentCallbackCommand
                {
                    OrderID = orderId,
                    PaymentGatewayID = transactionId ?? "N/A",
                    TotalAmount = actualAmount,
                    IsPaidSuccess = isSuccess,
                    ErrorCode = isSuccess ? null : vnpResponseCode
                };
                await Sender.Send(command, ct);

                return isSuccess
                    ? Redirect($"/payment/success?orderId={orderId}")
                    : Redirect($"/payment/failed?code={vnpResponseCode}");
            }
            catch (VnpayException)
            {
                return Redirect($"/payment/failed?code=SignatureInvalid");
            }
        }
    }
}
