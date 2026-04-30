using Connect.Application.Commons.DTOs;
using Connect.Application.Interfaces.Persistences;
using Connect.Domain.Core.Entities;
using FluentResults;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Payments.Queries.GetSpecificPayment
{
    internal sealed class GetSpecificPaymentHandler : IRequestHandler<GetSpecificPaymentQuery, PaymentDto>
    {
        private readonly IUnitOfWork unitOfWork;
        public GetSpecificPaymentHandler(IUnitOfWork _unitOfWork)
        {
            unitOfWork = _unitOfWork;
        }

        public async Task<PaymentDto> Handle(GetSpecificPaymentQuery request, CancellationToken cancellationToken)
        {
            var payment = await unitOfWork.Payments.FirstOrDefaultNoTrackingAsync(x => x.PaymentID == request.PaymentID, cancellationToken);
            if (payment == null)
                throw new Exception("No payments found");

            return new PaymentDto
            {
                PaymentID = payment.PaymentID,
                OrderID = payment.OrderID,
                PaymentType = payment.PaymentType,
                TransactionID = payment.TransactionID,
                BankingInfo = payment.BankingInfo,
                TotalAmount = payment.TotalAmount.Value,
                IsPaidSuccess = payment.IsPaidSuccess,
                PaidAt = payment.PaidAt
            };
        }
    }
}
