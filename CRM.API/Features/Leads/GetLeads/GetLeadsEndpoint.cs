using CRM.API.Common.Interfaces;
using CRM.API.Common.Models;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Features.Leads.GetLeads;

public class GetLeadsEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/leads", async (
        [AsParameters] GetLeadsQuery query,
        IMediator mediator,
        CancellationToken cancellationToken) =>
        Results.Ok(await mediator.Send(query, cancellationToken)))
            .WithName("GetLeads")
            .WithTags("Leads")
            .Produces<PagedResult<GetLeadsResponse>>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
            .WithSummary("Get a paginated list of leads with optional filtering");
    }
}