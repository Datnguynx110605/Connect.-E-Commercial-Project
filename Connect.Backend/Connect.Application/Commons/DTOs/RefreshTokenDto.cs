using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Commons.DTOs
{
    public record RefreshTokenDto
    {
        public string AccessToken { get; init; }
        public string RefreshToken { get; init; }
    }
}
