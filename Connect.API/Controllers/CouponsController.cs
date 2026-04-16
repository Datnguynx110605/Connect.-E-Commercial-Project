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

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllCoupons(CancellationToken cancellationToken)
        {
            var result = await Sender.Send(new GetAllCouponsQuery(), cancellationToken);
            return Ok(result);
        }

        [HttpGet("{id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetCoupon(int id, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(new GetSpecificCouponQuery { CouponID = id }, cancellationToken);
            return Ok(result);
        }

        [HttpPost]
        [Authorize("Admin")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateCoupon([FromBody] CreateCouponCommand command, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command, cancellationToken);
            return CreatedAtAction(nameof(GetCoupon), result);
        }

        [HttpPatch("{id:int}/expiry-date")]
        [Authorize("Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateExpiryDate(int id, [FromBody] UpdateCouponExpiryDateCommand command, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command with { CouponID = id }, cancellationToken);
            return Ok(result);
        }

        [HttpPatch("{id:int}/quantity")]
        [Authorize("Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateQuantity(int id, [FromBody] UpdateCouponQuantityCommand command, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command with { CouponID = id }, cancellationToken);
            return Ok(result);
        }
    }
}
