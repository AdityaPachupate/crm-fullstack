using CRM.API.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace CRM.API.Features.Rejoin.RestoreRejoin;

public class RestoreRejoinEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/rejoins/{id}/restore", async (Guid id, IMediator mediator, CancellationToken cancellationToken) =>
        {
            var request = new RestoreRejoinRequest(id);
            var result = await mediator.Send(new RestoreRejoinCommand(request), cancellationToken);
            return Results.Ok(result);
        })
        .WithName("RestoreRejoin")
        .WithTags("Rejoins")
        .Produces<RestoreRejoinResponse>(StatusCodes.Status200OK)
        .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
        .Produces<ProblemDetails>(StatusCodes.Status404NotFound)
        .WithSummary("Restore a previously deleted rejoin record");
    }
}
