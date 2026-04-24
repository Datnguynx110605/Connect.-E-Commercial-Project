using Connect.Domain.Common;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Commons
{
    public record DomainEventNotification<T>(T Event) : INotification where T : DomainEvent;
}
