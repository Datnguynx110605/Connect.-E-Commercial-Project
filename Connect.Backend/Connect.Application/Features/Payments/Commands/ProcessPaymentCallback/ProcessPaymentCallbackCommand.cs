using FluentResults;
using MediatR;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Payments.Commands.ProcessPaymentCallback
{
    public sealed record ProcessPaymentCallbackCommand:IRequest<Result>
    {
        public HttpRequest HttpRequest { get; init; }
    }
}
