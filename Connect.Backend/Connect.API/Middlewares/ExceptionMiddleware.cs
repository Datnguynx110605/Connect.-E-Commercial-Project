namespace Connect.API.Middlewares
{
    public sealed class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;

        public ExceptionMiddleware(
            RequestDelegate next,
            ILogger<ExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task Invoke(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                var traceId = context.TraceIdentifier;

                _logger.LogError(ex,
                    "Unhandled exception. TraceId: {TraceId}", traceId);

                context.Response.ContentType = "application/json";

                var response = new
                {
                    title = "Internal Server Error",
                    status = StatusCodes.Status500InternalServerError,
                    traceId
                };

                context.Response.StatusCode = response.status;

                await context.Response.WriteAsJsonAsync(response);
            }
        }
    }
}
