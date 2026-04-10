using CRM.API.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace CRM.API.Features.Medicines.GetMedicines
{
    public class GetMedicinesEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet("/api/medicines", async (
                [Microsoft.AspNetCore.Http.AsParameters] GetMedicinesQuery query,
                IMediator mediator,
                CancellationToken ct) =>
            {
                var result = await mediator.Send(query, ct);
                return Results.Ok(result);
            })
            .WithName("GetMedicines")
            .WithTags("Medicines")
            .WithSummary("Get all active medicines with pagination");
        }
    }
}
