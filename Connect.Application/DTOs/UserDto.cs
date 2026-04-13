using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.DTOs
{
    public record UserDto
    {
        public string UserName { get; init; }
        public string Email { get; init; }
        public string PhoneNumber { get; init; }
        public string Address { get; init; }
        public DateTime CreatedAt { get; init; }
    }
}
