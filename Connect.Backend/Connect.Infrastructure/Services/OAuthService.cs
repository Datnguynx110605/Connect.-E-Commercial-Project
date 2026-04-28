using Connect.Application.Commons.DTOs;
using Connect.Application.Interfaces.Persistences;
using Connect.Application.Interfaces.Services;
using Connect.Domain.Core.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using OAuth2.Client;
using System.Collections.Specialized;
using System.Text;

namespace Connect.Infrastructure.Services
{
    public sealed class OAuthService : IOAuthService
    {
        private readonly IClient client;
        public OAuthService(IClient _client)
        {
            client = _client;
        }

        public Task<string> GetGoogleLoginLink()
        {
            return client.GetLoginLinkUriAsync();
        }

        public async Task<UserDto> ParseCallBack(HttpRequest request)
        {
            var code = request.Query["code"].ToString();
            if (string.IsNullOrEmpty(code))
                throw new InvalidOperationException("Missing authorization code.");

            var parameters= new NameValueCollection { { "code", code } };
            try
            {
                var result = await client.GetUserInfoAsync(parameters);

                return new UserDto
                {
                    UserName = new string(result.Email!.Split('@')[0].ToLower().Where(c => char.IsLetter(c)).ToArray()),
                    Email = result.Email,
                    OAuthProviderName = result.ProviderName
                };
            }
            catch (UnexpectedResponseException ex)
            {
                var errorDetail = ex.Response?.Content ?? ex.Message;
                throw new Exception($"OAuth Error: {errorDetail}");
            }
        }
    }
}
