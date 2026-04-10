using CRM.API.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading;

namespace CRM.API.Features.Lookups.RestoreLookup
{
    public class RestoreLookupEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPost("/lookups/{id:guid}/restore", async (
                Guid id,
                IMediator mediator,
                CancellationToken ct) =>
            {
                var result = await mediator.Send(new RestoreLookupCommand(id), ct);
                return Results.Ok(result);
            })
            .WithName("RestoreLookup")
            .WithTags("Lookups")
            .WithSummary("Restore a soft-deleted lookup")
            .Produces<RestoreLookupResponse>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status404NotFound)
            .Produces<ProblemDetails>(StatusCodes.Status400BadRequest);
        }
    }
}
