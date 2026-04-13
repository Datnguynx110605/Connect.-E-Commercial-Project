using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Domain.Core.Enums
{
    public enum OrderStatus
    {
        Pending=0,
        Processing=1,
        Shipping=2,
        Completed=3,
        Cancelled=4
    }
}
