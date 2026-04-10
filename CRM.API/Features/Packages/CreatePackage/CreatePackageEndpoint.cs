using CRM.API.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Mvc;
using System.Threading;

namespace CRM.API.Features.Packages.CreatePackage
{
    public class CreatePackageEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPost("/packages", async (
                [FromBody] CreatePackageRequest request,
                IMediator mediator,
                CancellationToken cancellationToken)
                =>
            {
                var result = await mediator.Send(new CreatePackageCommand(request), cancellationToken);
                return Results.Created($"/packages/{result.Id}", result);
            })
            .WithName("CreatePackage")
            .WithTags("Packages")
            .Produces<CreatePackageResponse>(StatusCodes.Status201Created)
            .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces<ProblemDetails>(StatusCodes.Status409Conflict)
            .WithSummary("Create a new package");
        }
    }
}
