using CRM.API.Common.Interfaces;
using CRM.API.Common.Models;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace CRM.API.Features.Rejoin.GetRejoins;

public class GetRejoinsEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/rejoins", async ([AsParameters] GetRejoinsQuery query, IMediator mediator, CancellationToken cancellationToken) =>
        {
            var result = await mediator.Send(query, cancellationToken);
            return Results.Ok(result);
        })
        .WithName("GetRejoins")
        .WithTags("Rejoins")
        .Produces<PagedResult<GetRejoinsResponse>>(StatusCodes.Status200OK)
        .Produces<ProblemDetails>(StatusCodes.Status500InternalServerError)
        .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
        .WithSummary("Get a paginated list of rejoin records");
    }
}
