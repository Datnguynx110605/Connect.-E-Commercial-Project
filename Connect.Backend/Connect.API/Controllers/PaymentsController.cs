using Connect.Application.Features.Payments.Commands.CreatePayment;
using Connect.Application.Features.Payments.Commands.ProcessPaymentCallback;
using Connect.Application.Features.Payments.Queries.GetAllPayments;
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

        [HttpGet("getall-payment")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetAllPayments(CancellationToken cancellationToken)
        {
            var result = await Sender.Send(new GetAllPaymentsQuery(), cancellationToken);
            return Ok(result);
        }

        [HttpPost("create-paymenturl")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status422UnprocessableEntity)]
        public async Task<IActionResult> CreatePayment([FromBody] CreatePaymentCommand command, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command, cancellationToken);

            return result.IsSuccess
                ? Ok(new { PaymentUrl = result.Value })
                : NotFound(result.Errors);
        }

        [HttpGet("vnpay-callback")]
        [AllowAnonymous]
        [ApiExplorerSettings(IgnoreApi = false)] 
        [ProducesResponseType(StatusCodes.Status302Found)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> VnPayCallback(CancellationToken ct)
        {

            try
            {
                var callbackResult = paymentGateway.ParseCallback(Request);

                var command = new ProcessPaymentCallbackCommand
                {
                    PaymentID=callbackResult.PaymentID,
                    OrderID=callbackResult.OrderID,
                    PaymentType=callbackResult.PaymentType,
                    TransactionID=callbackResult.TransactionID,
                    BankingInfo=callbackResult.BankingInfo,
                    IsPaidSuccess=callbackResult.IsPaidSuccess,
                    PaidAt=callbackResult.PaidAt
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
