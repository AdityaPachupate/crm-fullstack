using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using FluentValidation;
using CRM.API.Common.Constants;

namespace CRM.API.Common.ExceptionHandling
{
    public class GlobalExceptionHandler(
        ILogger<GlobalExceptionHandler> logger,
        IWebHostEnvironment env) : IExceptionHandler
    {
        public async ValueTask<bool> TryHandleAsync(
            HttpContext httpContext, 
            Exception exception, 
            CancellationToken cancellationToken)
        {
            if (exception is BusinessException)
            {
                logger.LogWarning("Business exception: {Message}", exception.Message);
            }
            else if (exception is ValidationException)
            {
                logger.LogWarning("Validation exception: {Message}", exception.Message);
            }
            else
            {
                logger.LogError(exception, "Unhandled exception: {Message}", exception.Message);
            }

            var (statusCode, title, actionMessage) = exception switch
            {
                BusinessException be => (be.StatusCode, "Business Error", be.ActionDescription),
                ValidationException => (HttpStatusCode.BadRequest, "Validation Error", "validating the request data"),
                BadHttpRequestException => (HttpStatusCode.BadRequest, "Bad Request", "parsing the request body"),
                InvalidOperationException => (HttpStatusCode.Conflict, "Logic Error", $"executing {httpContext.Request.Method} {httpContext.Request.Path}"),
                UnauthorizedAccessException => (HttpStatusCode.Unauthorized, "Unauthorized", $"executing {httpContext.Request.Method} {httpContext.Request.Path}"),
                KeyNotFoundException => (HttpStatusCode.NotFound, "Not Found", "finding the requested resource"),
                _ => (HttpStatusCode.InternalServerError, "Internal Server Error", "processing your request")
            };

            var message = (statusCode == HttpStatusCode.InternalServerError && !env.IsDevelopment())
                ? LoggingMessages.InternalServerError
                : exception.Message;

            var problemDetails = new ProblemDetails
            {
                Status = (int)statusCode,
                Title = title,
                Detail = $"The error '{message}' was caused while {actionMessage}",
                Type = exception.GetType().Name
            };

            if (exception is ValidationException valException)
            {
                problemDetails.Extensions["errors"] = valException.Errors
                    .GroupBy(e => e.PropertyName)
                    .ToDictionary(
                        g => g.Key,
                        g => g.Select(x => x.ErrorMessage).ToArray()
                    );
            }

            problemDetails.Extensions["traceId"] = httpContext.Items["CorrelationId"];

            httpContext.Response.StatusCode = (int)statusCode;

            await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);

            return true;
        }
    }
}
