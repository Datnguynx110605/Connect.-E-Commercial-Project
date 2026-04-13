using Connect.Application.DTOs;
using Connect.Application.Interfaces.Persistences;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Orders.Commands.MarkAsPaid
{
    internal sealed class MarkAsPaidHandler : IRequestHandler<MarkAsPaidCommand, OrderDto>
    {
        private readonly IUnitOfWork unitOfWork;
        public MarkAsPaidHandler(IUnitOfWork _unitOfWork)
        {
            unitOfWork = _unitOfWork;
        }

        public async Task<OrderDto> Handle(MarkAsPaidCommand request, CancellationToken cancellationToken)
        {
            var order = await unitOfWork.Orders.GetByIdAsync(request.OrderID, cancellationToken);
            if (order == null)
                throw new Exception("Order not found");

            order.MarkAsPaid();

            unitOfWork.Orders.Update(order);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            return new OrderDto
            {
                OrderPaymentStatus = order.OrderPaymentStatus.ToString()
            };
        }
    }
}
