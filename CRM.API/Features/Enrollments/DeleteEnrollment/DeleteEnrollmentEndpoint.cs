using CRM.API.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Features.Enrollments.DeleteEnrollment
{
    public class DeleteEnrollmentEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapDelete("/enrollments/{id:guid}", async (
                Guid id, IMediator mediator,
                CancellationToken cancellationToken,
                [FromQuery] bool isPermanent = false
            ) =>
            {
                var result = await mediator.Send(new DeleteEnrollmentCommand(new DeleteEnrollmentRequest(id), isPermanent), cancellationToken);
                return Results.Ok(result);
            })
            .WithName("DeleteEnrollment")
            .WithTags("Enrollments")
            .Produces<DeleteEnrollmentResponse>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status404NotFound)
            .WithSummary("Delete an enrollment by ID (Use ?isPermanent=true for hard delete)");
        }
    }
}
