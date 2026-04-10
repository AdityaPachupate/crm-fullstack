using CRM.API.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading;

namespace CRM.API.Features.Medicines.DeleteMedicine
{
    public class DeleteMedicineEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapDelete("/api/medicines/{id:guid}", async (
                Guid id,
                [FromQuery] bool? isPermanent,
                IMediator mediator,
                CancellationToken ct) =>
            {
                var result = await mediator.Send(new DeleteMedicineCommand(id, isPermanent ?? false), ct);
                return Results.Ok(result);
            })
            .WithName("DeleteMedicine")
            .WithTags("Medicines")
            .WithSummary("Soft or permanently delete a medicine")
            .Produces<DeleteMedicineResponse>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status404NotFound);
        }
    }
}
