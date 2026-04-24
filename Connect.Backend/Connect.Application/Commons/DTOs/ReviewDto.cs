using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.Commons.DTOs
{
    public record ReviewDto
    {
        public int ReviewID { get; init; }
        public int UserID { get; init; }
        public int ProductID { get; init; }
        public int Rating { get; init; }
        public string Body { get; init; }
        public DateTime CreatedAt { get; init; }
    }
}
