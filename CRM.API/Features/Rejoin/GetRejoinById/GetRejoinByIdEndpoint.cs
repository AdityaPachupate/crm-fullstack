using CRM.API.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Features.Rejoin.GetRejoinById;

public class GetRejoinByIdEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/rejoins/{id:guid}", async (Guid id, IMediator mediator, CancellationToken cancellationToken) =>
        {
            var result = await mediator.Send(new GetRejoinByIdQuery(id), cancellationToken);
            return Results.Ok(result);
        })
        .WithName("GetRejoinById")
        .WithTags("Rejoins")
        .Produces<GetRejoinByIdResponse>(StatusCodes.Status200OK)
        .Produces<ProblemDetails>(StatusCodes.Status404NotFound)
        .WithSummary("Get a specific rejoin record by ID");
    }
}
