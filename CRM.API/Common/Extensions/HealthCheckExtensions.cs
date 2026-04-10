using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using System.Text.Json;

namespace CRM.API.Common.Extensions
{
    public static class HealthCheckExtensions
    {
        public static Task WriteResponse(HttpContext context, HealthReport report)
        {
            context.Response.ContentType = "application/json";

            var response = new
            {
                status = report.Status.ToString(),
                results = report.Entries.Select(e => new
                {
                    key = e.Key,
                    status = e.Value.Status.ToString(),
                    description = e.Value.Description,
                    data = e.Value.Data
                })
            };

            return context.Response.WriteAsync(JsonSerializer.Serialize(response, new JsonSerializerOptions { WriteIndented = true }));
        }
    }
}
