using Connect.Application.Features.Products.Commands.CreateProduct;
using Connect.Application.Features.Products.Commands.DeleteProduct;
using Connect.Application.Features.Products.Commands.UpdateProductImage;
using Connect.Application.Features.Products.Commands.UpdateProductStock;
using Connect.Application.Features.Products.Queries.GetAllProducts;
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

        [HttpGet]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllProducts(CancellationToken cancellationToken)
        {
            var result = await Sender.Send(new GetAllProductsQuery(), cancellationToken);
            return Ok(result);
        }

        [HttpGet("{id:int}")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetProductDetail(int id, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(new GetProductDetailQuery { ProductID = id }, cancellationToken);
            return Ok(result);
        }

        [HttpPost]
        [Authorize("Admin")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateProduct([FromBody] CreateProductCommand command, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command, cancellationToken);
            return CreatedAtAction(nameof(GetProductDetail), new { id = result.ProductName }, result);
        }

        [HttpPatch("{id:int}/stock")]
        [Authorize("Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateStock(int id, [FromBody] UpdateProductStockCommand command, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command with { ProductID = id }, cancellationToken);
            return Ok(result);
        }

        [HttpPatch("{id:int}/image")]
        [Authorize("Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateImage(int id, [FromBody] UpdateProductImageCommand command, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command with { ProductID = id }, cancellationToken);
            return Ok(result);
        }

        [HttpDelete("{id:int}")]
        [Authorize("Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteProduct(int id, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(new DeleteProductCommand { ProductID = id }, cancellationToken);
            return Ok(result);
        }
    }
}
