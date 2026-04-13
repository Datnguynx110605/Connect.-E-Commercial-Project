using Connect.Domain.Common;
using Connect.Domain.Core.ValueObjects;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Domain.Events.UserEvents
{
    public record UserUpdatedProfileEvent:DomainEvent
    {
        public UserName UserName { get; }
        public UserUpdatedProfileEvent(UserName name)
        {
            UserName = name;
        }
    }
}
