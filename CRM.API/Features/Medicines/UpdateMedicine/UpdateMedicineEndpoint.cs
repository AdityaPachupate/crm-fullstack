using CRM.API.Common.Interfaces;
using MediatR;

namespace CRM.API.Features.Medicines.UpdateMedicine
{
    public class UpdateMedicineEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPut("/medicines/{id:guid}", async (Guid id, [Microsoft.AspNetCore.Mvc.FromBody] UpdateMedicineRequest request, IMediator mediator, CancellationToken ct) =>
            {
                var result = await mediator.Send(new UpdateMedicineCommand(id, request), ct);
                return Results.Ok(result);
            })
            .WithName("UpdateMedicine")
            .WithTags("Medicines")
            .WithSummary("Update medicine details or activation status");
        }
    }
}
