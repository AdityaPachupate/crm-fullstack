using CRM.API.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading;

namespace CRM.API.Features.Medicines.GetMedicineById
{
    public class GetMedicineByIdEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet("/api/medicines/{id:guid}", async (
                Guid id,
                IMediator mediator,
                CancellationToken ct) =>
            {
                var result = await mediator.Send(new GetMedicineByIdQuery(id), ct);
                return Results.Ok(result);
            })
            .WithName("GetMedicineById")
            .WithTags("Medicines")
            .WithSummary("Get a medicine by ID")
            .Produces<GetMedicineByIdResponse>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status404NotFound);
        }
    }
}
