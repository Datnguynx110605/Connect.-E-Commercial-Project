using Connect.Application.Features.Coupons.Commands.CreateCoupon;
using Connect.Application.Features.Coupons.Commands.UpdateCouponExpiryDate;
using Connect.Application.Features.Coupons.Commands.UpdateCouponQuantity;
using Connect.Application.Features.Coupons.Queries.GetAllCoupons;
using Connect.Application.Features.Coupons.Queries.GetSpecificCoupon;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Connect.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public sealed class CouponsController : APIController
    {
        public CouponsController(ISender sender) : base(sender) { }

        [HttpGet("getall-coupon")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetAllCoupons(CancellationToken cancellationToken)
        {
            var result = await Sender.Send(new GetAllCouponsQuery(), cancellationToken);
            return Ok(result);
        }

        [HttpGet("{id:int}/get-couponbyid")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetCoupon(int id, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(new GetSpecificCouponQuery { CouponID = id }, cancellationToken);
            return Ok(result);
        }

        [HttpPost("create-coupon")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status422UnprocessableEntity)]
        public async Task<IActionResult> CreateCoupon([FromBody] CreateCouponCommand command, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command, cancellationToken);
            return CreatedAtAction(nameof(GetCoupon), new { id = result.CouponID }, result);
        }

        [HttpPatch("{id:int}/update-expiry-date")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status422UnprocessableEntity)]
        public async Task<IActionResult> UpdateExpiryDate(int id, [FromBody] UpdateCouponExpiryDateCommand command, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command with { CouponID = id }, cancellationToken);
            return Ok(result);
        }

        [HttpPatch("{id:int}/update-quantity")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateQuantity(int id, [FromBody] UpdateCouponQuantityCommand command, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command with { CouponID = id }, cancellationToken);
            return Ok(result);
        }
    }
}
