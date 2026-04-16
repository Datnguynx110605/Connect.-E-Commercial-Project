using Connect.Application.Features.Carts.Commands.AddToCart;
using Connect.Application.Features.Carts.Commands.ReduceCartAmount;
using Connect.Application.Features.Carts.Commands.RemoveCart;
using Connect.Application.Features.Carts.Queries.GetAllCarts;
using Connect.Application.Features.Carts.Queries.GetUserCart;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Connect.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public sealed class CartsController : APIController
    {
        public CartsController(ISender sender) : base(sender) { }

        [HttpGet]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllCarts(CancellationToken cancellationToken)
        {
            var result = await Sender.Send(new GetAllCartsQuery(), cancellationToken);
            return Ok(result);
        }

        [HttpGet("me")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetUserCart(CancellationToken cancellationToken)
        {
            var result = await Sender.Send(new GetUserCartQuery(), cancellationToken);
            return Ok(result);
        }

        [HttpPost]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> AddToCart( [FromBody] AddToCartCommand command, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command, cancellationToken);
            return CreatedAtAction(nameof(GetUserCart), result);
        }

        [HttpPatch("{id:int}/reduce")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ReduceCartAmount(int id, [FromBody] ReduceCartAmountCommand command, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command with { CartID = id }, cancellationToken);
            return Ok(result);
        }

        [HttpDelete("{id:int}")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> RemoveCart(int id, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(new RemoveCartCommand { CartID = id }, cancellationToken);
            return Ok(result);
        }
    }
}
