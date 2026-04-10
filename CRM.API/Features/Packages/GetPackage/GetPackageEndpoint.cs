using CRM.API.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;

namespace CRM.API.Features.Packages.GetPackage
{
    public class GetPackageEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet("/packages/{id:guid}", async (
                Guid id,
                bool? isTrash,
                IMediator mediator,
                CancellationToken cancellationToken)
                =>
                Results.Ok(await mediator.Send(new GetPackageQuery(id, isTrash ?? false), cancellationToken)))
            .WithName("GetPackage")
            .WithTags("Packages")
            .Produces<GetPackageResponse>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status404NotFound)
            .WithSummary("Get a single package by its ID");
        }
    }
}
