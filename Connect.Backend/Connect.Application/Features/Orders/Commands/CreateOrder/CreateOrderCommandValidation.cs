using FluentValidation;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Features.Orders.Commands.CreateOrder
{
    internal sealed class CreateOrderCommandValidation:AbstractValidator<CreateOrderCommand>
    {
        public CreateOrderCommandValidation()
        {
            RuleFor(x => x.items)
                .NotEmpty().WithMessage("Items is required");

            RuleFor(x => x.Quantity)
                .NotEmpty().WithMessage("Quantity is required")
                .GreaterThan(0).WithMessage("Quantity is invalid");

            RuleFor(x => x.UnitPrice)
                .NotEmpty().WithMessage("UnitPrice is required")
                .GreaterThan(0).WithMessage("UnitPrice is invalid");
        }
    }
}
