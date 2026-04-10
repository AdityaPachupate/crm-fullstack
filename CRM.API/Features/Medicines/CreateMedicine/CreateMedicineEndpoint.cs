using CRM.API.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace CRM.API.Features.Medicines.CreateMedicine
{
    public class CreateMedicineEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPost("/api/medicines", async (CreateMedicineRequest request, ISender sender) =>
            {
                var command = new CreateMedicineCommand(request);
                var result = await sender.Send(command);
                return Results.Created($"/api/medicines/{result.Id}", result);
            })
            .WithName("CreateMedicine")
            .WithTags("Medicines")
            .Produces<CreateMedicineResponse>(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status409Conflict);
        }
    }
}
