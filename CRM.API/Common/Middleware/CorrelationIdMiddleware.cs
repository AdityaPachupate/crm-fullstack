using Microsoft.AspNetCore.Http;
using Serilog.Context;
using System;
using System.Threading.Tasks;

namespace CRM.API.Common.Middleware
{
    public class CorrelationIdMiddleware(RequestDelegate next)
    {
        public async Task InvokeAsync(HttpContext context)
        {
            var correlationId = Guid.NewGuid().ToString();

            context.Items["CorrelationId"] = correlationId;

            using (LogContext.PushProperty("CorrelationId", correlationId))
            {
                await next(context);
            }
        }
    }
}
