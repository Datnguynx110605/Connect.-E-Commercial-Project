using Connect.Application.Interfaces.Services;
using Connect.Domain.Core.Entities;
using Connect.Infrastructure.Settings;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Connect.Infrastructure.Services
{
    public class JWTService:IJWTService
    {
        private readonly JWTOptions options;
        public JWTService(IOptions<JWTOptions> _options)
        {
            options = _options.Value;
        }

        public string GenerateAccessToken(User user)
        {
            SigningCredentials signingCredentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(options.SecretKey)),
            SecurityAlgorithms.HmacSha256);

            Claim[] claims = new[]
            {
            new Claim(JwtRegisteredClaimNames.Sub, user.UserID.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email.Value),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

            JwtSecurityToken token = new JwtSecurityToken(
                issuer: options.Issuer,
                audience: options.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(10),
                signingCredentials: signingCredentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
