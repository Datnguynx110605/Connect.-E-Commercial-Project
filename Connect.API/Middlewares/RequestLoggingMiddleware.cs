using System.Diagnostics;

namespace Connect.API.Middlewares
{
    public sealed class RequestLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RequestLoggingMiddleware> _logger;

        public RequestLoggingMiddleware(
            RequestDelegate next,
            ILogger<RequestLoggingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task Invoke(HttpContext context)
        {
            var stopwatch = Stopwatch.StartNew();

            var request = context.Request;
            var traceId = context.TraceIdentifier;

            _logger.LogInformation(
                "Incoming Request {Method} {Path} TraceId: {TraceId}",
                request.Method,
                request.Path,
                traceId);

            await _next(context);

            stopwatch.Stop();

            _logger.LogInformation(
                "Outgoing Response {StatusCode} in {Elapsed} ms TraceId: {TraceId}",
                context.Response.StatusCode,
                stopwatch.ElapsedMilliseconds,
                traceId);
        }
    }
}
