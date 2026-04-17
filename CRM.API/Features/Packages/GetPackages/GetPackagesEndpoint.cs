using CRM.API.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace CRM.API.Features.Packages.GetPackages
{
    public class GetPackagesEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet("/packages", async (
                bool? isTrash,
                IMediator mediator,
                CancellationToken ct)
                =>
                Results.Ok(await mediator.Send(new GetPackagesQuery(isTrash ?? false), ct)))
            .WithName("GetPackages")
            .WithTags("Packages")
            .Produces<List<GetPackagesResponse>>(StatusCodes.Status200OK)
            .WithSummary("Get all treatment packages");
        }
    }
}
