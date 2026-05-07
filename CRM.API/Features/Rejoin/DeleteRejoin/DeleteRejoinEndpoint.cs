using CRM.API.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace CRM.API.Features.Rejoin.DeleteRejoin;

public class DeleteRejoinEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapDelete("/rejoins/{id:guid}", async (Guid id, IMediator mediator, CancellationToken cancellationToken, [FromQuery] bool isPermanent = false) =>
        {
            var request = new DeleteRejoinRequest(id, isPermanent);
            var result = await mediator.Send(new DeleteRejoinCommand(request), cancellationToken);
            return Results.Ok(result);
        })
        .WithName("DeleteRejoin")
        .WithTags("Rejoins")
        .Produces<DeleteRejoinResponse>(StatusCodes.Status200OK)
        .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
        .Produces<ProblemDetails>(StatusCodes.Status404NotFound)
        .WithSummary("Delete a rejoin record");

        app.MapPost("/rejoin-records/{id}/trash", async (Guid id, IMediator mediator, CancellationToken cancellationToken) =>
        {
            var request = new DeleteRejoinRequest(id, false);
            var result = await mediator.Send(new DeleteRejoinCommand(request), cancellationToken);
            return Results.Ok(result);
        })
        .WithName("TrashRejoin")
        .WithTags("Rejoins")
        .Produces<DeleteRejoinResponse>(StatusCodes.Status200OK)
        .WithSummary("Move a rejoin record to trash");
    }
}
