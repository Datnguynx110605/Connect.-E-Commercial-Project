using Connect.Application.Interfaces.Persistences;
using Connect.Application.Interfaces.Services;
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
        private readonly IPaymentGateway paymentGateway;
        public ProcessPaymentCallbackHandler(IUnitOfWork _unitOfWork, IPaymentGateway _paymentGateway)
        {
            unitOfWork = _unitOfWork;
            paymentGateway = _paymentGateway;
        }

        public async Task<Result> Handle(ProcessPaymentCallbackCommand request, CancellationToken cancellationToken)
        {
            var result = paymentGateway.ParseCallback(request.HttpRequest);

            var transaction = await unitOfWork.Payments.AnyAsync(x => x.PaymentID == result.PaymentID, cancellationToken);
            if (transaction)
                return Result.Ok();

            var order = await unitOfWork.Orders.GetByIdAsync(result.OrderID, cancellationToken);
            if (order == null)
                return Result.Fail("Order not found");

            Currency totalAmount = Currency.Create(order.OrderFinalPrice.Value);

            Payment payment = Payment.CreatePayment(result.PaymentID, order.OrderID, result.PaymentType, result.TransactionID, result.BankingInfo, totalAmount, result.IsPaidSuccess, result.PaidAt);

            await unitOfWork.BeginTransactionAsync(cancellationToken);
            await unitOfWork.Payments.AddAsync(payment, cancellationToken);
            order.MarkAsPaidForPaymentGateway(payment.IsPaidSuccess);
            unitOfWork.Orders.Update(order);
            await unitOfWork.CommitTransactionAsync(cancellationToken);

            return Result.Ok();
        }
    }
}
