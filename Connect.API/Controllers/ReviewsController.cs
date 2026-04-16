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

        [HttpGet]
        [Authorize("Admin")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllReviews(CancellationToken cancellationToken)
        {
            var result = await Sender.Send(new GetAllReviewsQuery(), cancellationToken);
            return Ok(result);
        }

        [HttpGet("product/{productId:int}")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetReviewByProduct(int productId, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(new GetReviewByProductQuery { ProductID = productId }, cancellationToken);
            return Ok(result);
        }

        [HttpPost]
        [Authorize("Admin")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateReview([FromBody] CreateReviewCommand command, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command, cancellationToken);
            return CreatedAtAction(nameof(GetAllReviews), result);
        }

        [HttpPut("{id:int}")]
        [Authorize("Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateReview(int id, [FromBody] UpdateReviewCommand command, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command with { ReviewID = id }, cancellationToken);
            return Ok(result);
        }

        [HttpDelete("{id:int}")]
        [Authorize("Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteReview(int id, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(new DeleteReviewCommand { ReviewID = id }, cancellationToken);
            return Ok(result);
        }
    }
}
