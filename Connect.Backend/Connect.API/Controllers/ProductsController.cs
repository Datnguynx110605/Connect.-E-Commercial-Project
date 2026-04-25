using Connect.Application.Features.Products.Commands.CreateProduct;
using Connect.Application.Features.Products.Commands.DeleteProduct;
using Connect.Application.Features.Products.Commands.UpdateProductImage;
using Connect.Application.Features.Products.Commands.UpdateProductStock;
using Connect.Application.Features.Products.Queries.GetAllProducts;
using Connect.Application.Features.Products.Queries.GetProductByCategory;
using Connect.Application.Features.Products.Queries.GetProductDetail;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Connect.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public sealed class ProductsController : APIController
    {
        public ProductsController(ISender sender) : base(sender) { }

        [HttpGet("getall-product")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllProducts(CancellationToken cancellationToken)
        {
            var result = await Sender.Send(new GetAllProductsQuery(), cancellationToken);
            return Ok(result);
        }

        [HttpGet("{id:int}/get-productdetail")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetProductDetail(int id, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(new GetProductDetailQuery { ProductID = id }, cancellationToken);
            return Ok(result);
        }

        [HttpGet("get-product-bycategory")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetProductByCategory(int id, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(new GetProductByCategoryQuery { CategoryID = id }, cancellationToken);
            return Ok(result);
        }

        [HttpPost("create-product")]
        [Authorize(Roles = "Admin")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status422UnprocessableEntity)]
        public async Task<IActionResult> CreateProduct([FromForm] CreateProductCommand command, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command, cancellationToken);
            return CreatedAtAction(nameof(GetProductDetail), new { id = result.ProductID }, result);
        }

        [HttpPatch("{id:int}/update-stock")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status422UnprocessableEntity)]
        public async Task<IActionResult> UpdateStock(int id, [FromBody] UpdateProductStockCommand command, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command with { ProductID = id }, cancellationToken);
            return Ok(result);
        }

        [HttpPatch("{id:int}/update-image")]
        [Authorize(Roles = "Admin")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateImage(int id, [FromForm] UpdateProductImageCommand command, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command with { ProductID = id }, cancellationToken);
            return Ok(result);
        }

        [HttpDelete("{id:int}/delete-product")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
        public async Task<IActionResult> DeleteProduct(int id, CancellationToken cancellationToken)
        {
            await Sender.Send(new DeleteProductCommand { ProductID = id }, cancellationToken);
            return NoContent();
        }
    }
}
