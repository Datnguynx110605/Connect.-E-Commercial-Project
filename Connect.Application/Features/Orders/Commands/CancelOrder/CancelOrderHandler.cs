using Connect.Application.DTOs;
using Connect.Application.Interfaces.Persistences;
using Connect.Application.Interfaces.Services;
using Connect.Domain.Core.Entities;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Orders.Commands.CancelOrder
{
    internal sealed class CancelOrderHandler : IRequestHandler<CancelOrderCommand, OrderDto>
    {
        private readonly IUnitOfWork unitOfWork;
        private readonly ICurrentUserService currentUserService;
        public CancelOrderHandler(IUnitOfWork _unitOfWork, ICurrentUserService _currentUserService)
        {
            unitOfWork = _unitOfWork;
            currentUserService = _currentUserService;
        }

        public async Task<OrderDto> Handle(CancelOrderCommand request, CancellationToken cancellationToken)
        {
            bool identity = await unitOfWork.Users.AnyAsync(x => x.UserID == currentUserService.UserID, cancellationToken);
            if (!identity)
                throw new UnauthorizedAccessException("User is not in the system");

            var order = await unitOfWork.Orders.GetByIdAsync(request.OrderID, cancellationToken);
            if (order == null)
                throw new Exception("Order not found");

            if(currentUserService.UserID != order.UserID)
                    throw new UnauthorizedAccessException("No permission to access");

            foreach (var item in order.OrderItems)
            {
                var productID = item.ProductID;
                var quantity = item.Quantity;

                var product = await unitOfWork.Products.GetByIdAsync(productID,cancellationToken);
                if (product == null)
                    throw new Exception("Product not found");

                product.AddToStock(quantity);
                unitOfWork.Products.Update(product);
            }

            order.CancelOrder();

            await unitOfWork.BeginTransactionAsync(cancellationToken);
            try
            {
                unitOfWork.Orders.Update(order);
                await unitOfWork.SaveChangesAsync(cancellationToken);
                await unitOfWork.CommitTransactionAsync(cancellationToken);
            }
            catch
            {
                await unitOfWork.RollbackTransactionAsync(cancellationToken);
                throw;
            }

            return new OrderDto
            {
                OrderStatus = order.OrderStatus.ToString()
            };
        }
    }
}
