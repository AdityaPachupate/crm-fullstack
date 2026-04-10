using CRM.API.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Features.FollowUps.CreateFollowUp;

public class CreateFollowUpEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/followups", async (
            [FromBody] CreateFollowUpRequest request, 
            IMediator mediator, 
            CancellationToken cancellationToken
        ) =>
        {
            var result = await mediator.Send(new CreateFollowUpCommand(request), cancellationToken);
            return Results.Ok(result);
        })
        .WithName("CreateFollowUp")
        .WithTags("FollowUps")
        .Produces<CreateFollowUpResponse>(StatusCodes.Status201Created)
        .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
        .WithSummary("Schedule a new follow-up for a lead");
    }
}
