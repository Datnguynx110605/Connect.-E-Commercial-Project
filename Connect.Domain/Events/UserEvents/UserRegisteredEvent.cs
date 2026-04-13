using Connect.Domain.Common;
using Connect.Domain.Core.ValueObjects;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Domain.Events.UserEvents
{
    public record UserRegisteredEvent:DomainEvent
    {
        public Email UserEmail { get; }
        public UserRegisteredEvent(Email email)
        {
            UserEmail = email;
        }
    }
}
