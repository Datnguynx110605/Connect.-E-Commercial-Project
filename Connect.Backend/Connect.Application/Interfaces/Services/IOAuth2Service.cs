using Connect.Application.Commons.DTOs;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Text;

namespace Connect.Application.Interfaces.Services
{
    public interface IOAuth2Service
    {
        Task<string> GetGoogleLoginLink();
        Task<UserDto> ParseCallBack(HttpRequest request);
    }
}
