using Connect.Application.Interfaces.Persistences;
using Connect.Domain.Core.Entities;
using Connect.Domain.Core.ValueObjects;
using FluentResults;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Payments.Commands.ProcessPaymentCallback
{
    internal sealed class ProcessPaymentCallbackHandler : IRequestHandler<ProcessPaymentCallbackCommand, Result>
    {
        private readonly IUnitOfWork unitOfWork;
        public ProcessPaymentCallbackHandler(IUnitOfWork _unitOfWork)
        {
            unitOfWork = _unitOfWork;
        }

        public async Task<Result> Handle(ProcessPaymentCallbackCommand request, CancellationToken cancellationToken)
        {
            var transaction = await unitOfWork.Payments.AnyAsync(x => x.PaymentGatewayID == request.PaymentGatewayID, cancellationToken);
            if (transaction)
                return Result.Ok();

            var order = await unitOfWork.Orders.GetByIdAsync(request.OrderID, cancellationToken);
            if (order == null)
                return Result.Fail("Order not found");

            Currency totalAmount = Currency.Create(order.OrderTotalPrice.Value);

            Payment payment = Payment.CreatePayment(order.OrderID, request.PaymentGatewayID , totalAmount , request.IsPaidSuccess, request.ErrorCode);

            await unitOfWork.Payments.AddAsync(payment, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            return Result.Ok();
        }
    }
}
