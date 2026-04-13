using Connect.Application.Interfaces.Services;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text;

namespace Connect.Infrastructure.Services
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor httpContextAccessor;
        public CurrentUserService(IHttpContextAccessor _httpContextAccessor)
        {
            httpContextAccessor = _httpContextAccessor;
        }

        public int UserID =>
         int.Parse(
             httpContextAccessor.HttpContext?.User?
                 .FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");

        public string Role =>
         httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;
    }
}
