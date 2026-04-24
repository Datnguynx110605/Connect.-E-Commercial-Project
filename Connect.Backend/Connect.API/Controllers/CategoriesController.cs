using Connect.Application.Features.Categories.Commands.CreateCategory;
using Connect.Application.Features.Categories.Commands.DeleteCategory;
using Connect.Application.Features.Categories.Commands.UpdateCategoryName;
using Connect.Application.Features.Categories.Queries.GetAllCategories;
using Connect.Application.Features.Categories.Queries.GetSpecificCategory;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Connect.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public sealed class CategoriesController : APIController
    {
        public CategoriesController(ISender sender) : base(sender) { }

        [HttpGet]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllCategories(CancellationToken cancellationToken)
        {
            var result = await Sender.Send(new GetAllCategoriesQuery(), cancellationToken);
            return Ok(result);
        }

        [HttpGet("{id:int}")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetCategory(int id, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(new GetSpecificCategoryCommand { CategoryID = id }, cancellationToken);
            return Ok(result);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateCategory([FromBody] CreateCategoryCommand command, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command, cancellationToken);
            return CreatedAtAction(nameof(GetCategory), new { id = result.CategoryID }, result);
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateCategoryName(int id, [FromBody] UpdateCategoryNameCommand command, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command with { CategoryID = id }, cancellationToken);
            return Ok(result);
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteCategory(int id, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(new DeleteCategoryCommand { CategoryID = id }, cancellationToken);
            return Ok(result);
        }
    }
}
