using CRM.API.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Features.FollowUps.GetTodayFollowUps;

public class GetTodayFollowUpsEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/followups/today", async (
            IMediator mediator,
            CancellationToken cancellationToken
        ) =>
        {
            var result = await mediator.Send(new GetTodayFollowUpsQuery(), cancellationToken);
            return Results.Ok(result);
        })
        .WithName("GetTodayFollowUps")
        .WithTags("FollowUps")
        .Produces<List<GetTodayFollowUpsResponse>>(StatusCodes.Status200OK)
        .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
        .WithSummary("Get all pending follow-ups for today or overdue");
    }
}
