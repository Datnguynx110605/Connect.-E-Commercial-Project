using Connect.Application.Features.Orders.Commands.CancelOrder;
using Connect.Application.Features.Orders.Commands.CreateOrder;
using Connect.Application.Features.Orders.Commands.MarkAsPaid;
using Connect.Application.Features.Orders.Commands.UpdateOrderStatusToCompleted;
using Connect.Application.Features.Orders.Commands.UpdateOrderStatusToShipping;
using Connect.Application.Features.Orders.Queries.GetAllOrders;
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

        [HttpGet]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllOrders(CancellationToken cancellationToken)
        {
            var result = await Sender.Send(new GetAllOrdersQuery(), cancellationToken);
            return Ok(result);
        }

        [HttpGet("history")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetOrderHistory(CancellationToken cancellationToken)
        {
            var result = await Sender.Send(new GetOrderHistoryQuery(), cancellationToken);
            return Ok(result);
        }

        [HttpPost]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderCommand command, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command, cancellationToken);
            return CreatedAtAction(nameof(GetOrderHistory), result);
        }

        [HttpPatch("{id:int}/cancel")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> CancelOrder(int id, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(new CancelOrderCommand { OrderID = id }, cancellationToken);
            return Ok(result);
        }

        [HttpPatch("{id:int}/shipping")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateToShipping(int id, [FromBody] UpdateOrderStatusToShippingCommand command, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command with { OrderID = id }, cancellationToken);
            return Ok(result);
        }

        [HttpPatch("{id:int}/completed")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateToCompleted(int id, [FromBody] UpdateOrderStatusToCompletedCommand command, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command with { OrderID = id }, cancellationToken);
            return Ok(result);
        }

        [HttpPatch("{id:int}/paid")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> MarkAsPaid(int id, [FromBody] MarkAsPaidCommand command, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command with { OrderID = id }, cancellationToken);
            return Ok(result);
        }
    }
}
