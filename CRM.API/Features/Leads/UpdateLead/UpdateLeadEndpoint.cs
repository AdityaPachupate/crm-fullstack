using CRM.API.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Features.Leads.UpdateLead
{
    public class UpdateLeadEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPut("/leads/{id:guid}", async (Guid id, [FromBody] UpdateLeadRequest request, IMediator mediator, CancellationToken cancellationToken) =>
            {
                if (id != request.Id)
                {
                    return Results.BadRequest("The ID in the URL must match the ID in the body.");
                }
                
                var result = await mediator.Send(new UpdateLeadCommand(request), cancellationToken);
                return Results.Ok(result);
            })
            .WithName("UpdateLead")
            .WithTags("Leads")
            .Produces<UpdateLeadResponse>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces<ProblemDetails>(StatusCodes.Status404NotFound)
            .Produces<ProblemDetails>(StatusCodes.Status409Conflict)
            .WithSummary("Update an existing lead");
        }
    }
}
