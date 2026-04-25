using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace Connect.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public abstract class APIController : ControllerBase
    {
        protected readonly ISender Sender;

        protected APIController(ISender sender)
        {
            Sender = sender;
        }

        protected IActionResult NotFoundProblem(string detail, string? instance = null)
            => Problem(
                statusCode: StatusCodes.Status404NotFound,
                title: "Resource Not Found",
                detail: detail,
                instance: instance ?? HttpContext.Request.Path);

        protected IActionResult ConflictProblem(string detail)
            => Problem(
                statusCode: StatusCodes.Status409Conflict,
                title: "Conflict",
                detail: detail,
                instance: HttpContext.Request.Path);

        protected IActionResult ForbiddenProblem(string detail)
            => Problem(
                statusCode: StatusCodes.Status403Forbidden,
                title: "Forbidden",
                detail: detail,
                instance: HttpContext.Request.Path);

        protected IActionResult UnprocessableProblem(string detail)
            => Problem(
                statusCode: StatusCodes.Status422UnprocessableEntity,
                title: "Business Rule Violation",
                detail: detail,
                instance: HttpContext.Request.Path);

        protected IActionResult ValidationProblem(ModelStateDictionary modelState)
            => ValidationProblem(new ValidationProblemDetails(modelState)
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Validation Failed",
                Instance = HttpContext.Request.Path
            });
    }
}
