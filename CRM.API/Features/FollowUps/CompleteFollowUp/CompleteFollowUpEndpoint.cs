using CRM.API.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Features.FollowUps.CompleteFollowUp;

public class CompleteFollowUpEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("/followups/{id}/complete", async (
            Guid id,
            [FromBody] CompleteFollowUpRequest request,
            IMediator mediator,
            CancellationToken cancellationToken
        ) =>
        {
            // Ensure the ID in URL matches the body or just override the body
            var command = new CompleteFollowUpCommand(request with { FollowUpId = id });
            var result = await mediator.Send(command, cancellationToken);
            return Results.Ok(result);
        })
        .WithName("CompleteFollowUp")
        .WithTags("FollowUps")
        .Produces<CompleteFollowUpResponse>(StatusCodes.Status200OK)
        .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
        .Produces<ProblemDetails>(StatusCodes.Status404NotFound)
        .WithSummary("Mark a follow-up as completed and update lead status");
    }
}
