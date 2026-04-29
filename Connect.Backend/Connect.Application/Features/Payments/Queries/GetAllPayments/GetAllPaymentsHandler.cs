using Connect.Application.Commons.DTOs;
using Connect.Application.Interfaces.Persistences;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Payments.Queries.GetAllPayments
{
    internal sealed class GetAllPaymentsHandler : IRequestHandler<GetAllPaymentsQuery, PagedResult<PaymentDto>>
    {
        private readonly IUnitOfWork unitOfWork;
        public GetAllPaymentsHandler(IUnitOfWork _unitOfWork)
        {
            unitOfWork = _unitOfWork;
        }

        public async Task<PagedResult<PaymentDto>> Handle(GetAllPaymentsQuery request, CancellationToken cancellationToken)
        {
            var (items, total) = await unitOfWork.Payments.GetPagedAsync(request.Page, request.PageSize, cancellationToken: cancellationToken);

            return new PagedResult<PaymentDto>
            {
                Items = items.Select(x => new PaymentDto
                {
                    PaymentID = x.PaymentID,
                    OrderID = x.OrderID,
                    PaymentType = x.PaymentType,
                    TransactionID = x.TransactionID,
                    BankingInfo = x.BankingInfo,
                    TotalAmount = x.TotalAmount.Value,
                    IsPaidSuccess = x.IsPaidSuccess,
                    PaidAt = x.PaidAt
                }).ToList(),
                TotalCount = total,
                Page = request.Page,
                PageSize = request.PageSize
            };
        }
    }
}
