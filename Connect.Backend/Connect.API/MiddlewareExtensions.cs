using Connect.API.Middlewares;

namespace Connect.API
{
    public static class MiddlewareExtensions
    {
        public static IApplicationBuilder UseCustomMiddleware(this IApplicationBuilder app)
        {
            app.UseMiddleware<CorrelationMiddleware>();

            app.UseMiddleware<RequestLoggingMiddleware>();

            app.UseMiddleware<ExceptionMiddleware>();

            app.UseMiddleware<PerformanceMiddleware>();

            return app;
        }
    }
}
