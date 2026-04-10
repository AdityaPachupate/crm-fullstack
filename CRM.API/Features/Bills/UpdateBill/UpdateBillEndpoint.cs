using CRM.API.Common.Interfaces;
using MediatR;

namespace CRM.API.Features.Bills.UpdateBill;

public class UpdateBillEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("/bills/{id}", async (Guid id, UpdateBillRequest request, ISender sender) =>
        {
            var result = await sender.Send(new UpdateBillCommand(id, request));
            return Results.Ok(result);
        })
        .WithName("UpdateBill")
        .WithTags("Bills")
        .Produces<UpdateBillResponse>(StatusCodes.Status200OK);
    }
}
