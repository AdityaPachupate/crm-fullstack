using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CRM.API.Common.Interfaces;
using CRM.API.Features.Leads.DeleteLead;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Features.FollowUps.DeleteFollowUp
{
    public class DeleteFollowUpEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapDelete("/followups/{id:guid}", async (
                Guid id,
                IMediator mediator,
                CancellationToken cancellationToken,
                [FromQuery] bool isPermanent = false
            ) =>
            {
                var result = await mediator.Send(
                    new DeleteFollowUpCommand(new DeleteFollowUpRequest(id), isPermanent), 
                    cancellationToken);

                return Results.Ok(result);
            })
            .WithName("DeleteFollowUp")
            .WithTags("FollowUps")
            .Produces<DeleteFollowUpResponse>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status404NotFound)
            .WithSummary("Delete a FollowUp (Use ?isPermanent=true for hard delete)");
        }
    }
}