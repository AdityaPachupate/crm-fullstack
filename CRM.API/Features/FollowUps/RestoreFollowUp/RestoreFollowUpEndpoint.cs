using CRM.API.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Features.FollowUps.RestoreFollowUp;

public class RestoreFollowUpEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/followups/{id:guid}/restore", async (
            Guid id, 
            IMediator mediator, 
            CancellationToken cancellationToken
        ) =>
        {
            var result = await mediator.Send(new RestoreFollowUpCommand(new RestoreFollowUpRequest(id)), cancellationToken);
            return Results.Ok(result);
        })
        .WithName("RestoreFollowUp")
        .WithTags("FollowUps")
        .Produces<RestoreFollowUpResponse>(StatusCodes.Status200OK)
        .Produces<ProblemDetails>(StatusCodes.Status404NotFound)
        .WithSummary("Restore a soft-deleted follow-up from the trash");
    }
}