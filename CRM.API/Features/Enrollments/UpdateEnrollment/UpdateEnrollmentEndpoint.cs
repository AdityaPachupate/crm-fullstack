using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CRM.API.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Features.Enrollments.UpdateEnrollment
{
    public class UpdateEnrollmentEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPut("/enrollments", async (
                [FromBody] UpdateEnrollmentRequest request,
                IMediator mediator,
                CancellationToken cancellationToken
            ) =>
            {
                var result = await mediator.Send(new UpdateEnrollmentCommand(request), cancellationToken);
                return Results.Ok(result);
            })
            .WithName("UpdateEnrollment")
            .WithTags("Enrollments")
            .Produces<UpdateEnrollmentResponse>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status404NotFound)
            .WithSummary("Update an enrollment details");
        }
    }
}