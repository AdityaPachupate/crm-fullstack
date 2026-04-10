using System.Reflection;
using CRM.API.Common.Interfaces;

namespace CRM.API.Common.Extensions
{
    public static class EndpointExtensions
    {
        public static void MapEndpoints(this IEndpointRouteBuilder app, Assembly assembly)
        {
            var endpoints = assembly.GetTypes()
                .Where(t => typeof(IEndpoint).IsAssignableFrom(t) && !t.IsInterface && !t.IsAbstract)
                .Select(Activator.CreateInstance)
                .Cast<IEndpoint>();

            var apiGroup = app.MapGroup("/api");

            foreach (var endpoint in endpoints)
                endpoint.MapEndpoint(apiGroup);
        }
    }
}
