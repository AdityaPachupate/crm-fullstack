using CRM.API.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using System;

namespace CRM.API.Features.Medicines.RestoreMedicine
{
    public class RestoreMedicineEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPost("/medicines/{id}/restore", async (Guid id, ISender sender) =>
            {
                var result = await sender.Send(new RestoreMedicineCommand(id));
                return result ? Results.Ok() : Results.BadRequest();
            })
            .WithName("RestoreMedicine")
            .WithTags("Medicines")
            .WithOpenApi()
            .WithSummary("Restore a soft-deleted medicine");
        }
    }
}
