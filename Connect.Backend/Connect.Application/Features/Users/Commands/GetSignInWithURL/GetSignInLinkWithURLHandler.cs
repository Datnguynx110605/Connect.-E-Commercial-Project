using Connect.Application.Interfaces.Services;
using FluentResults;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Users.Commands.GetSignInWithURL
{
    internal sealed class GetSignInLinkWithURLHandler : IRequestHandler<GetSignInWithURLQuery, string>
    {
        private readonly IOAuth2Service oAuthService;
        public GetSignInLinkWithURLHandler(IOAuth2Service _oAuthService)
        {
            oAuthService = _oAuthService;
        }

        public async Task<string> Handle(GetSignInWithURLQuery request, CancellationToken cancellationToken)
        {
            return await oAuthService.GetGoogleLoginLink();
        }
    }
}
