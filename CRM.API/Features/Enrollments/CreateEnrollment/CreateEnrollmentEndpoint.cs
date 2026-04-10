using CRM.API.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Features.Enrollments.CreateEnrollment
{
    public class CreateEnrollmentEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPost("/enrollments", async ([FromBody] CreateEnrollmentRequest request, IMediator mediator, CancellationToken cancellationToken) =>
            {
                var result = await mediator.Send(new CreateEnrollmentCommand(request), cancellationToken);
                return Results.Created($"/enrollments/{result.Id}", result);
            })
            .WithName("CreateEnrollment")
            .WithTags("Enrollments")
            .Produces<CreateEnrollmentResponse>(StatusCodes.Status201Created)
            .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
            .Produces<ProblemDetails>(StatusCodes.Status404NotFound)
            .WithSummary("Enroll a lead into a package");
        }
    }
}
