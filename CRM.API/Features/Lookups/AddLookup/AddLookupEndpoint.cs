using CRM.API.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Mvc;
using System.Threading;

namespace CRM.API.Features.Lookups.AddLookup
{
    public class AddLookupEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPost("/lookups", async (
                [FromBody] AddLookupRequest request,
                IMediator mediator,
                CancellationToken cancellationToken)
                =>
            {
                var result = await mediator.Send(new AddLookupCommand(request), cancellationToken);
                return Results.Created("/api/lookups", result);
            })
            .WithName("AddLookup")
            .WithTags("Lookups")
            .Produces<AddLookupResponse>(StatusCodes.Status201Created)
            .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces<ProblemDetails>(StatusCodes.Status409Conflict)
            .WithSummary("Add a new lookup value");
        }
    }
}
