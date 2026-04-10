using CRM.API.Common.Interfaces;
using MediatR;

namespace CRM.API.Features.Medicines.UpdateMedicine
{
    public class UpdateMedicineEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPut("/api/medicines", async (UpdateMedicineRequest request, IMediator mediator, CancellationToken ct) =>
            {
                var result = await mediator.Send(new UpdateMedicineCommand(request), ct);
                return Results.Ok(result);
            })
            .WithName("UpdateMedicine")
            .WithTags("Medicines")
            .WithSummary("Update medicine details or activation status");
        }
    }
}
