using CRM.API.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Mvc;
using System.Threading;

namespace CRM.API.Features.Lookups.UpdateLookup
{
    public class UpdateLookupEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPut("/lookups", async (
                [FromBody] UpdateLookupRequest request,
                IMediator mediator,
                CancellationToken cancellationToken)
                =>
                Results.Ok(await mediator.Send(new UpdateLookupCommand(request), cancellationToken)))
            .WithName("UpdateLookup")
            .WithTags("Lookups")
            .Produces<UpdateLookupResponse>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces<ProblemDetails>(StatusCodes.Status404NotFound)
            .WithSummary("Update an existing lookup value (DisplayName only)");
        }
    }
}
