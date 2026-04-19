using Connect.Application.Features.Payments.Commands.CreatePayment;
using Connect.Application.Features.Payments.Commands.ProcessPaymentCallback;
using Connect.Application.Interfaces.Services;
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
        private readonly IPaymentGateway paymentGateway;
        public PaymentsController(ISender sender, IPaymentGateway _paymentGateway) : base(sender)
        {
            paymentGateway = _paymentGateway;
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
        [AllowAnonymous]
        public async Task<IActionResult> VnPayCallback(CancellationToken ct)
        {

            try
            {
                var callbackResult = paymentGateway.ParseCallback(Request);

                var command = new ProcessPaymentCallbackCommand
                {
                    OrderID = callbackResult.OrderID,
                    PaymentGatewayID = callbackResult.PaymentGatewayID,
                    IsPaidSuccess = callbackResult.IsPaidSuccess,
                    ErrorCode = callbackResult.ErrorCode
                };

                await Sender.Send(command, ct);

                return Redirect($"/payment/success?orderId={callbackResult.OrderID}");
            }
            catch (VnpayException ex)
            {
                bool isSignatureFailed = ex.Message.Contains("Chữ ký") || ex.Message.Contains("signature");

                return isSignatureFailed
                    ? Redirect("/payment/failed?code=SignatureInvalid")
                    : Redirect($"/payment/failed?code={ex.PaymentResponseCode}");
            }
            catch (InvalidOperationException)
            {
                return Redirect("/payment/failed?code=InvalidOrderId");
            }
        }
    }
}
