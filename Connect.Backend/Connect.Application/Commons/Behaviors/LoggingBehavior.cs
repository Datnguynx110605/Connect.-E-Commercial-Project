using MediatR;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Text;

namespace Connect.Application.Commons.Behaviors
{
    public sealed class LoggingBehavior<TRequest, TResponse>: IPipelineBehavior<TRequest, TResponse> where TRequest : IRequest<TResponse>
    {
        private const int SlowRequestThresholdMs = 500;
        private readonly ILogger<LoggingBehavior<TRequest, TResponse>> _logger;
        public LoggingBehavior(ILogger<LoggingBehavior<TRequest, TResponse>> logger) => _logger = logger;

        public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
        {
            var requestName = typeof(TRequest).Name;
            _logger.LogInformation(
                "[START] Handling {RequestName} | Payload: {@Request}",
                requestName,
                request);

            var stopwatch = Stopwatch.StartNew();

            try
            {
                var response = await next();
                stopwatch.Stop();

                var elapsedMs = stopwatch.ElapsedMilliseconds;
                if (elapsedMs > SlowRequestThresholdMs)
                {
                    _logger.LogWarning(
                        "[SLOW] {RequestName} completed in {ElapsedMs}ms — exceeded threshold of {ThresholdMs}ms | Payload: {@Request}",
                        requestName,
                        elapsedMs,
                        SlowRequestThresholdMs,
                        request);
                }
                else
                {
                    _logger.LogInformation(
                        "[END] {RequestName} completed successfully in {ElapsedMs}ms",
                        requestName,
                        elapsedMs);
                }

                return response;
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                _logger.LogError(
                    ex,
                    "[FAILURE] {RequestName} failed after {ElapsedMs}ms | Error: {ErrorMessage} | Payload: {@Request}",
                    requestName,
                    stopwatch.ElapsedMilliseconds,
                    ex.Message,
                    request);

                throw;
            }
        }
    }
}
