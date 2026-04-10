using CRM.API.Common.Interfaces;
using MediatR;

namespace CRM.API.Features.Bills.RestoreBill;

public class RestoreBillEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/bills/{id}/restore", async (Guid id, ISender sender) =>
        {
            var result = await sender.Send(new RestoreBillCommand(new RestoreBillRequest(id)));
            return Results.Ok(result);
        })
        .WithName("RestoreBill")
        .WithTags("Bills")
        .Produces<RestoreBillResponse>(StatusCodes.Status200OK);
    }
}
