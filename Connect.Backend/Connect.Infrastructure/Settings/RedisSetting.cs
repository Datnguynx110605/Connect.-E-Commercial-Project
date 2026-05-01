using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Infrastructure.Settings
{
    public sealed class RedisSetting
    {
        public string ConnectionString { get; set; } = default!;
    }
}
