using CRM.API.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Features.Enrollments.RestoreEnrollment
{
    public class RestoreEnrollmentEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPost("/enrollments/{id:guid}/restore", async (
                Guid id, IMediator mediator,
                CancellationToken cancellationToken
            ) =>
            {
                var result = await mediator.Send(new RestoreEnrollmentCommand(new RestoreEnrollmentRequest(id)), cancellationToken);
                return Results.Ok(result);
            })
            .WithName("RestoreEnrollment")
            .WithTags("Enrollments")
            .Produces<RestoreEnrollmentResponse>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status404NotFound)
            .WithSummary("Restore a soft-deleted enrollment by ID");
        }
    }
}
