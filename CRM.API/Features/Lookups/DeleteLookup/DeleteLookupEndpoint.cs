using CRM.API.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Mvc;
using System.Threading;
using System;

namespace CRM.API.Features.Lookups.DeleteLookup
{
    public class DeleteLookupEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapDelete("/lookups/{id:guid}", async (
                Guid id,
                [FromQuery] bool? isPermanent,
                IMediator mediator,
                CancellationToken cancellationToken)
                =>
                Results.Ok(await mediator.Send(new DeleteLookupCommand(id, isPermanent ?? false), cancellationToken)))
            .WithName("DeleteLookup")
            .WithTags("Lookups")
            .Produces<DeleteLookupResponse>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status404NotFound)
            .WithSummary("Delete a lookup value (soft or permanent)");
        }
    }
}
