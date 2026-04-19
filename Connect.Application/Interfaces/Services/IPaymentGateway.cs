using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Interfaces.Services
{
    public interface IPaymentGateway
    {
        string CreatePaymentUrl(int orderId, decimal amount, string description);
    }
}
