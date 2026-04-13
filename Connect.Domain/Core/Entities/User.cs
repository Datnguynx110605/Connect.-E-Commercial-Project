using Connect.Domain.Common;
using Connect.Domain.Core.ValueObjects;
using Connect.Domain.Events.UserEvents;
using System;
using System.Collections.Generic;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;

namespace Connect.Domain.Core.Entities
{
    public class User:AggregateRoot
    {
        public int UserID { get; private set; }
        public UserName UserName { get; private set; }
        public Email Email { get; private set; }
        public PhoneNumber PhoneNumber { get; private set; }
        public PasswordHash PasswordHash { get; private set; }
        public string Address { get; private set; }
        public string Role { get; private set; } = "Customer";
        public DateTime CreatedAt { get; private set; }
        private User() { }
        private User(UserName name, Email email, PhoneNumber phone, PasswordHash pass, string address)
        {
            UserName = name;
            Email = email;
            PhoneNumber = phone;
            PasswordHash = pass;
            Address = address;
            Role = "Customer";
            CreatedAt = DateTime.UtcNow;

            RaiseDomainEvent(new UserRegisteredEvent(Email));
        }

        public static User CreateUserProfile(UserName name, Email email, PhoneNumber phone, PasswordHash pass, string address)
        {
            if(string.IsNullOrWhiteSpace(address))
                throw new DomainExceptions(
                    message: "Address must be required",
                    code: "REQUIRED-ADDRESS",
                    metadata: new Dictionary<string, object>
                    {
                        { "ADDRESS", address }
                    });

            return new User(name, email, phone, pass, address);
        }

        public void UpdateUserProfile(UserName name, Email email, PhoneNumber phone, string address)
        {
            if (string.IsNullOrWhiteSpace(address))
                throw new DomainExceptions(
                    message: "Address must be required",
                    code: "REQUIRED-ADDRESS",
                    metadata: new Dictionary<string, object>
                    {
                        { "ADDRESS", address }
                    });

            UserName = name;
            Email = email;
            PhoneNumber = phone;
            Address = address;

            RaiseDomainEvent(new UserUpdatedProfileEvent(name));
        }

        public void UpdateUserPassword(PasswordHash pass)
        {
            if(PasswordHash.Equals(pass))
                throw new DomainExceptions(
                    message: "New password must not be matched to the old password",
                    code: "INVALID-PASSWORDHASH");

            PasswordHash = pass;

            RaiseDomainEvent(new UserChangedPasswordEvent(UserName));
        }
    }
}
