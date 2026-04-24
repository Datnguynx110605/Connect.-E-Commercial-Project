using Connect.Application.DTOs;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Interfaces.Services
{
    public interface IPaymentGateway
    {
        string CreatePaymentUrl(int orderId, decimal amount);
        PaymentDto ParseCallback(HttpRequest request);
    }
}
