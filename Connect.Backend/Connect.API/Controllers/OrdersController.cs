using Connect.Application.Commons.DTOs;
using Connect.Application.Features.Orders.Commands.CancelOrder;
using Connect.Application.Features.Orders.Commands.CreateOrder;
using Connect.Application.Features.Orders.Commands.MarkAsPaid;
using Connect.Application.Features.Orders.Commands.UpdateOrderStatusToCompleted;
using Connect.Application.Features.Orders.Commands.UpdateOrderStatusToShipping;
using Connect.Application.Features.Orders.Queries.GetAllOrders;
using Connect.Application.Features.Orders.Queries.GetOrderById;
using Connect.Application.Features.Orders.Queries.GetOrderHistory;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Connect.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public sealed class OrdersController : APIController
    {
        public OrdersController(ISender sender) : base(sender) { }

        [HttpGet("getall-order")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetAllOrders(CancellationToken cancellationToken, [FromQuery] int page = DefaultPagination.Page, [FromQuery] int pageSize = DefaultPagination.PageSize)
        {
            var result = await Sender.Send(new GetAllOrdersQuery(page, pageSize), cancellationToken);
            return Ok(result);
        }

        [HttpGet("{id:int}/get-orderbyid")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetOrderById(int id, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(new GetSpecificOrderQuery { OrderID = id }, cancellationToken);
            return Ok(result);
        }

        [HttpGet("get-orderhistory")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetOrderHistory(CancellationToken cancellationToken, [FromQuery] int page = DefaultPagination.Page, [FromQuery] int pageSize = DefaultPagination.PageSize)
        {
            var result = await Sender.Send(new GetOrderHistoryQuery(page, pageSize), cancellationToken);
            return Ok(result);
        }

        [HttpPost("create-order")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status422UnprocessableEntity)]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderCommand command, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command, cancellationToken);
            return CreatedAtAction(nameof(GetOrderHistory), result);
        }

        [HttpPatch("{id:int}/cancel-order")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status422UnprocessableEntity)]
        public async Task<IActionResult> CancelOrder(int id, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(new CancelOrderCommand { OrderID = id }, cancellationToken);
            return Ok(result);
        }

        [HttpPatch("{id:int}/update-statustoshipping")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status422UnprocessableEntity)]
        public async Task<IActionResult> UpdateToShipping(int id, [FromBody] UpdateOrderStatusToShippingCommand command, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command with { OrderID = id }, cancellationToken);
            return Ok(result);
        }

        [HttpPatch("{id:int}/update-statustocompleted")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status422UnprocessableEntity)]
        public async Task<IActionResult> UpdateToCompleted(int id, [FromBody] UpdateOrderStatusToCompletedCommand command, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command with { OrderID = id }, cancellationToken);
            return Ok(result);
        }

        [HttpPatch("{id:int}/markas-paid")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status422UnprocessableEntity)]
        public async Task<IActionResult> MarkAsPaid(int id, [FromBody] MarkAsPaidCommand command, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command with { OrderID = id }, cancellationToken);
            return Ok(result);
        }
    }
}
