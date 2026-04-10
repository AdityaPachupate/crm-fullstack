using CRM.API.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Features.Enrollments.GetEnrollmentById
{
    public class GetEnrollmentByIdEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet("/enrollments/{id:guid}", async (
                Guid id, IMediator mediator,
                CancellationToken cancellationToken
            ) =>
            {
                var result = await mediator.Send(new GetEnrollmentByIdQuery(id), cancellationToken);
                return Results.Ok(result);
            })
            .WithName("GetEnrollmentById")
            .WithTags("Enrollments")
            .Produces<GetEnrollmentByIdResponse>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status404NotFound)
            .WithSummary("Get enrollment details by ID");
        }
    }
}
