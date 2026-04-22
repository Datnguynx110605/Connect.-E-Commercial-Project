using Connect.Application.Features.Users.Commands.CheckEmail;
using Connect.Application.Features.Users.Commands.CreateNewRefreshToken;
using Connect.Application.Features.Users.Commands.DeleteUserProfile;
using Connect.Application.Features.Users.Commands.ForgetPassword;
using Connect.Application.Features.Users.Commands.LoginUser;
using Connect.Application.Features.Users.Commands.RegisterUser;
using Connect.Application.Features.Users.Commands.UpdateUserPassword;
using Connect.Application.Features.Users.Commands.UpdateUserProfile;
using Connect.Application.Features.Users.Commands.VerifyEmail;
using Connect.Application.Features.Users.Queries.GetAllUsers;
using Connect.Application.Features.Users.Queries.GetUserProfile;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Connect.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public sealed class UsersController : APIController
    {
        public UsersController(ISender sender) : base(sender) { }

        [HttpPost("check-email")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CheckEmail([FromBody] CheckEmailCommand command, CancellationToken cancellationToken)
        {
            await Sender.Send(command, cancellationToken);
            return Ok("Verification email sent. Please check your inbox.");
        }

        [HttpPost("verify-email")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailCommand command, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command, cancellationToken);

            if (result.IsFailed)
                return BadRequest(result.Errors.Select(e => e.Message));

            return Ok(result.Value);
        }

        [HttpPost("register")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Register([FromBody] RegisterUserCommand command, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command, cancellationToken);
            return CreatedAtAction(nameof(GetProfile), result);
        }

        [HttpPost("login")]
        [EnableRateLimiting("LoginPolicy")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Login([FromBody] LoginUserCommand command, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command, cancellationToken);
            return Ok(result);
        }

        [HttpPost("refresh-token")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenCommand command, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command, cancellationToken);
            return Ok(result);
        }

        [HttpPost("forget-password")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ForgetPassword([FromBody] ForgetPasswordCommand command, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command, cancellationToken);
            return Ok(result);
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllUsers(CancellationToken cancellationToken)
        {
            var result = await Sender.Send(new GetAllUsersQuery(), cancellationToken);
            return Ok(result);
        }

        [HttpGet("profile")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetProfile(CancellationToken cancellationToken)
        {
            var result = await Sender.Send(new GetUserProfileQuery(), cancellationToken);
            return Ok(result);
        }

        [HttpPut("profile")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserProfileCommand command, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command, cancellationToken);
            return Ok(result);
        }

        [HttpPut("change-password")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ChangePassword([FromBody] UpdateUserPasswordCommand command, CancellationToken cancellationToken)
        {
            var result = await Sender.Send(command, cancellationToken);
            return Ok(result);
        }

        [HttpDelete("profile")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> DeleteProfile(CancellationToken cancellationToken)
        {
            var result = await Sender.Send(new DeleteUserProfileCommand(), cancellationToken);
            return Ok(result);
        }
    }
}
