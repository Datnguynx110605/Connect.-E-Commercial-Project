using Connect.Domain.Common;
using Connect.Domain.Core.ValueObjects;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Domain.Events.UserEvents
{
    public record UserChangedPasswordEvent:DomainEvent
    {
        public UserName UserName { get; }
        public UserChangedPasswordEvent(UserName name)
        {
            UserName = name;
        }
    }
}
