using CRM.API.Common.Interfaces;
using CRM.API.Common.Models;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading;

namespace CRM.API.Features.Lookups.GetLookups
{
    public class GetLookupsEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet("/lookups", async (
                [AsParameters] GetLookupsQuery query,
                IMediator mediator,
                CancellationToken cancellationToken)
                =>
                Results.Ok(await mediator.Send(query, cancellationToken)))
            .WithName("GetLookups")
            .WithTags("Lookups")
            .Produces<PagedResult<GetLookupsResponse>>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
            .WithSummary("Get a paginated list of lookup values");
        }
    }
}
