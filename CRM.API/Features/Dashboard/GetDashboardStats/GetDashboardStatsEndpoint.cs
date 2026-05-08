using CRM.API.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace CRM.API.Features.Dashboard.GetDashboardStats;

public class GetDashboardStatsEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/dashboard/stats", async (IMediator mediator, CancellationToken cancellationToken) =>
        {
            var result = await mediator.Send(new GetDashboardStatsQuery(), cancellationToken);
            return Results.Ok(result);
        })
        .WithName("GetDashboardStats")
        .WithTags("Dashboard")
        .Produces<GetDashboardStatsResponse>(StatusCodes.Status200OK)
        .WithSummary("Get summary statistics for the dashboard");
    }
}
