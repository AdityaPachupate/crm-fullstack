using CRM.API.Common.Interfaces;
using MediatR;

namespace CRM.API.Features.Bills.GetLeadBills
{
    public class GetLeadBillsEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet("/leads/{leadId}/bills", async (Guid leadId, IMediator mediator, CancellationToken ct) =>
            {
                var result = await mediator.Send(new GetLeadBillsQuery(leadId), ct);
                return Results.Ok(result);
            })
            .WithName("GetLeadBills")
            .WithTags("Bills")
            .WithSummary("Get all bills (financial history) for a specific lead");
        }
    }
}
