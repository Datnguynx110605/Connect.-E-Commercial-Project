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
        private readonly ICurrentUserService currentUserService;
        public CreatePaymentHandler(IUnitOfWork _unitOfWork, IPaymentGateway _paymentGateway, ICurrentUserService _currentUserService)
        {
            unitOfWork = _unitOfWork;
            paymentGateway = _paymentGateway;
            currentUserService = _currentUserService;
        }

        public async Task<Result<string>> Handle(CreatePaymentCommand request, CancellationToken cancellationToken)
        {
            var order = await unitOfWork.Orders.GetByIdAsync(request.OrderID, cancellationToken);
            if (order == null)
                return Result.Fail("Order not found");

            if (order.UserID != currentUserService.UserID)
                throw new UnauthorizedAccessException("No permission to access");

            var paymentURL = paymentGateway.CreatePaymentUrl(order.OrderID, order.OrderFinalPrice.Value);

            return Result.Ok(paymentURL);
        }
    }
}
