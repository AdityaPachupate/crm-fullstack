using CRM.API.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading;

namespace CRM.API.Features.Packages.UpdatePackage
{
    public class UpdatePackageEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPut("/packages/{id:guid}", async (
                Guid id,
                [FromBody] UpdatePackageRequest request,
                IMediator mediator,
                CancellationToken cancellationToken)
                =>
                Results.Ok(await mediator.Send(new UpdatePackageCommand(id, request), cancellationToken)))
            .WithName("UpdatePackage")
            .WithTags("Packages")
            .Produces<UpdatePackageResponse>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status404NotFound)
            .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces<ProblemDetails>(StatusCodes.Status409Conflict)
            .WithSummary("Update an existing package");
        }
    }
}
