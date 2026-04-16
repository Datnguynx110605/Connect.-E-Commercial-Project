using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.DTOs
{
    public record CategoryDto
    {
        public int CategoryID { get; init; }
        public string CategoryName { get; init; }
    }
}
