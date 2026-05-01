using Connect.Application.Commons.DTOs;
using Connect.Application.Features.Carts.Commands.AddToCart;
using Connect.Application.Features.Carts.Commands.IncreaseCartAmount;
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

        [HttpGet("getall-cart")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetAllCarts(CancellationToken cancellationToken, [FromQuery] int page = DefaultPagination.Page, [FromQuery] int pageSize = DefaultPagination.PageSize)
        {
            var result = await Sender.Send(new GetAllCartsQuery(page, pageSize), cancellationToken);
            return Ok(result);
        }

        [HttpGet("get-mycart")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetUserCart(CancellationToken cancellationToken, [FromQuery] int page = DefaultPagination.Page, [FromQuery] int pageSize = DefaultPagination.PageSize)
        {
            var result = await Sender.Send(new GetUserCartQuery(page, pageSize), cancellationToken);
            return Ok(result);
        }

        [HttpPost("addto-cart")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status422UnprocessableEntity)]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartCommand command, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command, cancellationToken);
            return CreatedAtAction(nameof(GetUserCart), result);
        }

        [HttpPatch("{id:int}/increase-cartamount")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status422UnprocessableEntity)]
        public async Task<IActionResult> IncreaseCartAmount(int id, [FromBody] IncreaseCartAmountCommand command , CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command with { CartID = id }, cancellationToken);
            return Ok(result);
        }

        [HttpPatch("{id:int}/reduce-cartamount")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ReduceCartAmount(int id, [FromBody] ReduceCartAmountCommand command, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command with { CartID = id }, cancellationToken);
            return Ok(result);
        }

        [HttpDelete("{id:int}/delete-cart")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> RemoveCart(int id, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(new RemoveCartCommand { CartID = id }, cancellationToken);
            return Ok(result);
        }
    }
}
