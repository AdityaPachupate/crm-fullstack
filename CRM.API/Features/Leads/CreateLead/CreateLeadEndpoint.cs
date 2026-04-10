using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CRM.API.Common.Interfaces;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Features.Leads.CreateLead
{
    public class CreateLeadEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPost("/leads", async (
                CreateLeadRequest request, IMediator mediator, CancellationToken cancellationToken
            ) =>
            {
                var result = await mediator.Send(new CreateLeadCommand(request), cancellationToken);
                return Results.CreatedAtRoute("GetLeadById", new { id = result.Id }, result);
            })
            .WithName("CreateLead")
            .WithTags("Leads")
            .Produces<CreateLeadResponse>(StatusCodes.Status201Created)
            .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces<ProblemDetails>(StatusCodes.Status409Conflict)
            .WithSummary("Create a new lead in the system");
        }
    }
}