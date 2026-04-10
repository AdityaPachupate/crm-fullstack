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
        app.MapDelete("/api/rejoins/{id}", async (Guid id, IMediator mediator, CancellationToken cancellationToken, [FromQuery] bool isPermanent = false) =>
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
        .WithSummary("Soft delete a custom rejoin record");
    }
}
