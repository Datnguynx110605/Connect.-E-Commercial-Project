using Connect.Application.Features.Reviews.Commands.CreateReview;
using Connect.Application.Features.Reviews.Commands.DeleteReview;
using Connect.Application.Features.Reviews.Commands.UpdateReview;
using Connect.Application.Features.Reviews.Queries.GetAllReviews;
using Connect.Application.Features.Reviews.Queries.GetReviewByProduct;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Connect.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public sealed class ReviewsController : APIController
    {
        public ReviewsController(ISender sender) : base(sender) { }

        [HttpGet("getall-review")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllReviews(CancellationToken cancellationToken, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var result = await Sender.Send(new GetAllReviewsQuery(page, pageSize), cancellationToken);
            return Ok(result);
        }

        [HttpGet("{productId:int}/get-reviewbyproduct")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetReviewByProduct(int productId, CancellationToken cancellationToken, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var result = await Sender.Send(new GetReviewByProductQuery { ProductID = productId, Page = page, PageSize = pageSize }, cancellationToken);
            return Ok(result);
        }

        [HttpPost("create-review")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
        public async Task<IActionResult> CreateReview([FromBody] CreateReviewCommand command, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command, cancellationToken);
            return CreatedAtAction(nameof(GetReviewByProduct), new { productId = command.ProductID }, result);
        }

        [HttpPut("{id:int}/update-review")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateReview(int id, [FromBody] UpdateReviewCommand command, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command with { ReviewID = id }, cancellationToken);
            return Ok(result);
        }

        [HttpDelete("{id:int}/delete-review")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteReview(int id, CancellationToken cancellationToken)
        {
            await Sender.Send(new DeleteReviewCommand { ReviewID = id }, cancellationToken);
            return NoContent();
        }
    }
}
