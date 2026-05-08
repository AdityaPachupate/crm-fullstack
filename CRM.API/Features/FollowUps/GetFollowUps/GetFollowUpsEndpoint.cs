using CRM.API.Common.Enums;
using CRM.API.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CRM.API.Features.FollowUps.GetFollowUps;

public class GetFollowUpsEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/followups", async (
            IMediator mediator,
            CancellationToken cancellationToken,
            [FromQuery] FollowUpStatus? status,
            [FromQuery] DateOnly? startDate,
            [FromQuery] DateOnly? endDate,
            [FromQuery] Guid? leadId,
            [FromQuery] bool isTrash = false) =>
        {
            var query = new GetFollowUpsQuery(status, startDate, endDate, leadId, isTrash);
            var result = await mediator.Send(query, cancellationToken);
            return Results.Ok(result);
        })
        .WithName("GetFollowUps")
        .WithTags("FollowUps")
        .Produces<List<GetFollowUpsResponse>>(StatusCodes.Status200OK)
        .WithSummary("Get filtered follow-ups");
    }
}
