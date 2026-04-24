using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Application.DTOs
{
    public sealed record NotificationDto(
        string Id,
        string Type,
        string Title,
        string Body,
        DateTime CreatedAt,
        object? Payload = null);
}
