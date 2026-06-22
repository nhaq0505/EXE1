using System.Net;
using System.Text.Json;
using GreenSolution.Core.Exceptions;
using FluentValidation;

namespace GreenSolution.API.Middleware
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unhandled exception occurred.");
                await HandleExceptionAsync(context, ex);
            }
        }

        private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";
            
            var statusCode = (int)HttpStatusCode.InternalServerError;
            string message = "An internal server error occurred.";
            object? errors = null;

            switch (exception)
            {
                case AppException appEx:
                    statusCode = appEx.StatusCode;
                    message = appEx.Message;
                    break;

                case ValidationException valEx:
                    statusCode = (int)HttpStatusCode.BadRequest;
                    message = "Validation failed.";
                    errors = valEx.Errors.Select(e => new 
                    {
                        Property = e.PropertyName,
                        Error = e.ErrorMessage
                    }).ToList();
                    break;

                case KeyNotFoundException:
                    statusCode = (int)HttpStatusCode.NotFound;
                    message = exception.Message;
                    break;

                case UnauthorizedAccessException:
                    statusCode = (int)HttpStatusCode.Unauthorized;
                    message = "Unauthorized access.";
                    break;

                default:
                    message = exception.Message; // You might want to be careful with exposing raw system exception messages in production, but it is useful for testing.
                    break;
            }

            context.Response.StatusCode = statusCode;

            var responsePayload = new
            {
                statusCode,
                message,
                errors
            };

            var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
            var jsonString = JsonSerializer.Serialize(responsePayload, options);

            await context.Response.WriteAsync(jsonString);
        }
    }
}
