using CRM.API.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Features.Bills.DeleteBill
{
    public class DeleteBillEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapDelete("/bills/{id:guid}", async (
                Guid id, IMediator mediator,
                CancellationToken cancellationToken,
                [FromQuery] bool isPermanent = false
            ) =>
            {
                var result = await mediator.Send(new DeleteBillCommand(new DeleteBillRequest(id), isPermanent), cancellationToken);
                return Results.Ok(result);
            })
            .WithName("DeleteBill")
            .WithTags("Bills")
            .Produces<DeleteBillResponse>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status404NotFound)
            .WithSummary("Delete a bill by ID (Use ?isPermanent=true for hard delete)");
        }
    }
}
