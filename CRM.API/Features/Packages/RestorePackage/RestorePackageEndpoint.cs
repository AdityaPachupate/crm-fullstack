using CRM.API.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Mvc;
using System.Threading;
using System;

namespace CRM.API.Features.Packages.RestorePackage
{
    public class RestorePackageEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPatch("/packages/{id:guid}/restore", async (
                Guid id,
                IMediator mediator,
                CancellationToken cancellationToken)
                =>
                Results.Ok(await mediator.Send(new RestorePackageCommand(id), cancellationToken)))
            .WithName("RestorePackage")
            .WithTags("Packages")
            .Produces<RestorePackageResponse>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status404NotFound)
            .WithSummary("Restore a soft-deleted package");
        }
    }
}
