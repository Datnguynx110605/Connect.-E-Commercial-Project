using Connect.Application.Commons.DTOs;
using Connect.Application.Features.Users.Commands.CheckEmail;
using Connect.Application.Features.Users.Commands.CreateNewRefreshToken;
using Connect.Application.Features.Users.Commands.DeleteUserProfile;
using Connect.Application.Features.Users.Commands.ForgetPassword;
using Connect.Application.Features.Users.Commands.GetSignInWithURL;
using Connect.Application.Features.Users.Commands.LoginUser;
using Connect.Application.Features.Users.Commands.ProcessOAuthCallback;
using Connect.Application.Features.Users.Commands.RegisterUser;
using Connect.Application.Features.Users.Commands.UpdateUserPassword;
using Connect.Application.Features.Users.Commands.UpdateUserProfile;
using Connect.Application.Features.Users.Commands.VerifyEmail;
using Connect.Application.Features.Users.Queries.GetAllUsers;
using Connect.Application.Features.Users.Queries.GetUserByEmail;
using Connect.Application.Features.Users.Queries.GetUserByPhoneNumber;
using Connect.Application.Features.Users.Queries.GetUserByUserName;
using Connect.Application.Features.Users.Queries.GetUserProfile;
using Connect.Application.Interfaces.Services;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using OAuth2.Client;

namespace Connect.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public sealed class UsersController : APIController
    {
        private readonly IOAuth2Service oAuthService;
        public UsersController(ISender sender, IOAuth2Service _oAuthService) : base(sender) 
        {
            oAuthService = _oAuthService;
        }

        [HttpPost("check-email")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status429TooManyRequests)]
        public async Task<IActionResult> CheckEmail([FromBody] CheckEmailCommand command, CancellationToken cancellationToken)
        {
            await Sender.Send(command, cancellationToken);
            return Ok(new { Message = "Verification email sent. Please check your inbox." });
        }

        [HttpPost("verify-email")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailCommand command, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command, cancellationToken);

            if (result.IsFailed)
                return BadRequest(new ValidationProblemDetails
                {
                    Title = "Email Verification Failed",
                    Status = StatusCodes.Status400BadRequest,
                    Detail = string.Join("; ", result.Errors.Select(e => e.Message)),
                    Instance = HttpContext.Request.Path
                });

            return Ok(result.Value);
        }

        [HttpPost("register")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
        public async Task<IActionResult> Register([FromBody] RegisterUserCommand command, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command, cancellationToken);
            return CreatedAtAction(nameof(GetProfile), result);
        }

        [HttpPost("login")]
        [EnableRateLimiting("LoginPolicy")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status429TooManyRequests)]
        public async Task<IActionResult> Login([FromBody] LoginUserCommand command, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command, cancellationToken);
            return Ok(result);
        }

        [HttpGet("get-oauthauthurl")]
        [EnableRateLimiting("LoginPolicy")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status422UnprocessableEntity)]
        public async Task<IActionResult> GetGoogleAuthURL(CancellationToken cancellationToken)
        {
            var result = await Sender.Send(new GetSignInWithURLQuery(), cancellationToken);
            return Redirect(result);
        }

        [HttpGet("oauth-callback")]
        [AllowAnonymous]
        [ApiExplorerSettings(IgnoreApi = false)]
        [ProducesResponseType(StatusCodes.Status302Found)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GoogleCallBack(CancellationToken cancellationToken)    
        {
            var command = new ProcessOAuthCallbackCommand { HttpRequest = Request };
            var result = await Sender.Send(command, cancellationToken);
            return Redirect($"http://localhost:3000/home?accessToken={Uri.EscapeDataString(result.AccessToken)}&refreshToken={Uri.EscapeDataString(result.RefreshToken)}");
        }

        [HttpPost("refresh-token")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenCommand command, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command, cancellationToken);
            return Ok(result);
        }

        [HttpPost("forget-password")] 
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status422UnprocessableEntity)]
        public async Task<IActionResult> ForgetPassword([FromBody] ForgetPasswordCommand command, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command, cancellationToken);
            return Ok(result);
        }

        [HttpGet("getall-user")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetAllUsers(CancellationToken cancellationToken, [FromQuery] int page = DefaultPagination.Page, [FromQuery] int pageSize = DefaultPagination.PageSize)
        {
            var result = await Sender.Send(new GetAllUsersQuery(page, pageSize), cancellationToken);
            return Ok(result);
        }

        [HttpGet("get-userbyusername")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetUserByUserName (string userName,CancellationToken cancellationToken)
        {
            var result = await Sender.Send(new GetUserByUserNameQuery { UserName = userName }, cancellationToken);
            return Ok(result);
        }

        [HttpGet("get-userbyemail")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetUserByEmail (string email,CancellationToken cancellationToken)
        {
            var result = await Sender.Send(new GetUserByEmailQuery { Email = email}, cancellationToken);
            return Ok(result);
        }

        [HttpGet("get-userbyphonenumber")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetUserByPhoneNumber (string phoneNumber,CancellationToken cancellationToken)
        {
            var result = await Sender.Send(new GetUserByPhoneNumberQuery { PhoneNumber = phoneNumber }, cancellationToken);
            return Ok(result);
        }

        [HttpGet("get-profile")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetProfile(CancellationToken cancellationToken)
        {
            var result = await Sender.Send(new GetUserProfileQuery(), cancellationToken);
            return Ok(result);
        }

        [HttpPut("update-profile")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status422UnprocessableEntity)]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserProfileCommand command, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command, cancellationToken);
            return Ok(result);
        }

        [HttpPut("change-password")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status422UnprocessableEntity)]
        public async Task<IActionResult> ChangePassword([FromBody] UpdateUserPasswordCommand command, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command, cancellationToken);
            return Ok(result);
        }

        [HttpDelete("delete-profile")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> DeleteProfile(CancellationToken cancellationToken)
        {
            await Sender.Send(new DeleteUserProfileCommand(), cancellationToken);
            return NoContent();
        }
    }
}
