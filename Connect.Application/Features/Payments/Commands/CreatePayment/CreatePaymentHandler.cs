using Connect.Application.Interfaces.Persistences;
using Connect.Application.Interfaces.Services;
using FluentResults;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Payments.Commands.CreatePayment
{
    internal sealed class CreatePaymentHandler : IRequestHandler<CreatePaymentCommand, Result<string>>
    {
        private readonly IUnitOfWork unitOfWork;
        private readonly IPaymentGateway paymentGateway;
        public CreatePaymentHandler(IUnitOfWork _unitOfWork, IPaymentGateway _paymentGateway)
        {
            unitOfWork = _unitOfWork;
            paymentGateway = _paymentGateway;
        }

        public async Task<Result<string>> Handle(CreatePaymentCommand request, CancellationToken cancellationToken)
        {
            var order = await unitOfWork.Orders.GetByIdAsync(request.OrderID, cancellationToken);
            if (order == null)
                throw new Exception("Order not found");

            var paymentURL = paymentGateway.CreatePaymentUrl(order.OrderID, order.OrderTotalPrice.Value, $"Order payment: {order.OrderID}");

            return Result.Ok(paymentURL);
        }
    }
}
