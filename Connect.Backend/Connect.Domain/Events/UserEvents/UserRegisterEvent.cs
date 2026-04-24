using Connect.Domain.Common;
using Connect.Domain.Core.ValueObjects;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Domain.Events.UserEvents
{
    public record UserRegisterEvent:DomainEvent
    {
        public int UserID { get; }
        public UserName UserName { get; }
        public Email UserEmail { get; }
        public UserRegisterEvent(int userID, UserName userName, Email email)
        {
            UserID = userID;
            UserName = userName;
            UserEmail = email;
        }
    }
}
