using CRM.API.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Features.Leads.RestoreLead;

public class RestoreLeadEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/leads/{id:guid}/restore", async (
            Guid id, IMediator mediator, CancellationToken cancellationToken
        ) =>
        {
            var result = await mediator.Send(new RestoreLeadCommand(new RestoreLeadRequest(id)), cancellationToken);
            return Results.Ok(result);
        })
        .WithName("RestoreLead")
        .WithTags("Leads")
        .Produces<RestoreLeadResponse>(StatusCodes.Status200OK)
        .Produces<ProblemDetails>(StatusCodes.Status404NotFound)
        .WithSummary("Restore a soft-deleted lead from the trash");
    }
}
