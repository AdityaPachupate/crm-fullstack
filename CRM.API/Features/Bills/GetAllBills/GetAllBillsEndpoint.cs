using CRM.API.Common.Interfaces;
using CRM.API.Common.Models;
using MediatR;

namespace CRM.API.Features.Bills.GetAllBills;

public class GetAllBillsEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/bills", async (
            [AsParameters] GetAllBillsRequest request,
            ISender sender) =>
        {
            var result = await sender.Send(new GetAllBillsQuery(request));
            return Results.Ok(result);
        })
        .WithName("GetAllBills")
        .WithTags("Bills")
        .Produces<PagedResult<GetAllBillsResponse>>(StatusCodes.Status200OK);
    }
}