using CRM.API.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Features.Rejoin.UpdateRejoin;

public class UpdateRejoinEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("/rejoins/{id:guid}", async (Guid id, [FromBody] UpdateRejoinRequest request, IMediator mediator, CancellationToken cancellationToken) =>
        {
            var command = new UpdateRejoinCommand(request with { Id = id });
            var result = await mediator.Send(command, cancellationToken);
            return Results.Ok(result);
        })
        .WithName("UpdateRejoin")
        .WithTags("Rejoins")
        .Produces<UpdateRejoinResponse>(StatusCodes.Status200OK)
        .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
        .Produces<ProblemDetails>(StatusCodes.Status404NotFound)
        .WithSummary("Update an existing rejoin record");
    }
}
