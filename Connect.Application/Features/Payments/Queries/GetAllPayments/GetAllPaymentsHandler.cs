using Connect.Application.DTOs;
using Connect.Application.Interfaces.Persistences;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Payments.Queries.GetAllPayments
{
    internal sealed class GetAllPaymentsHandler : IRequestHandler<GetAllPaymentsQuery, IEnumerable<PaymentDto>>
    {
        private readonly IUnitOfWork unitOfWork;
        public GetAllPaymentsHandler(IUnitOfWork _unitOfWork)
        {
            unitOfWork = _unitOfWork;
        }

        public async Task<IEnumerable<PaymentDto>> Handle(GetAllPaymentsQuery request, CancellationToken cancellationToken)
        {
            var payment = await unitOfWork.Payments.GetAllNoTrackingAsync(cancellationToken);
            if (payment == null)
                throw new Exception("Payment not found");

            return payment.Select(x => new PaymentDto
            {
                PaymentID=x.PaymentID,
                OrderID=x.OrderID,
                PaymentType=x.PaymentType,
                TransactionID=x.TransactionID,
                BankingInfo=x.BankingInfo,
                TotalAmount=x.TotalAmount.Value,
                IsPaidSuccess=x.IsPaidSuccess,
                PaidAt=x.PaidAt
            });
        }
    }
}
