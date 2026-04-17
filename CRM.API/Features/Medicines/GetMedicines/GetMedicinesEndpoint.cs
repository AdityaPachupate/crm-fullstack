using CRM.API.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace CRM.API.Features.Medicines.GetMedicines
{
    public class GetMedicinesEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet("/medicines", async (
                bool? isTrash,
                IMediator mediator,
                CancellationToken ct)
                =>
                Results.Ok(await mediator.Send(new GetMedicinesQuery(isTrash ?? false), ct)))
            .WithName("GetMedicines")
            .WithTags("Medicines")
            .Produces<List<GetMedicinesResponse>>(StatusCodes.Status200OK)
            .WithSummary("Get all medicines");
        }
    }
}
