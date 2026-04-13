using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.DTOs
{
    public record ReviewDto
    {
        public int UserID { get; init; }
        public int ProductID { get; init; }
        public int Rating { get; init; }
        public string Body { get; init; }
    }
}
