using CRM.API.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace CRM.API.Features.Bills.CreateBill
{
    public class CreateBillEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPost("/bills", async (CreateBillRequest request, IMediator mediator, CancellationToken ct) =>
            {
                var result = await mediator.Send(new CreateBillCommand(request), ct);
                return Results.Created($"/bills/{result.Id}", result);
            })
            .WithName("CreateBill")
            .WithTags("Bills")
            .WithSummary("Create a new bill (Package, Medicine, or both)")
            .Produces<CreateBillResponse>(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);
        }
    }
}
