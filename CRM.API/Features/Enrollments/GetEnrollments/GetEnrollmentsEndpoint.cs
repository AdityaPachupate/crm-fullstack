using CRM.API.Common.Interfaces;
using CRM.API.Common.Models;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Features.Enrollments.GetEnrollments
{
    public class GetEnrollmentsEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet("/enrollments", async (
                IMediator mediator,
                CancellationToken cancellationToken,
                [FromQuery] int pageNumber = 1,
                [FromQuery] int pageSize = 10,
                [FromQuery] bool isTrash = false,
                [FromQuery] DateOnly? startDateFrom = null,
                [FromQuery] DateOnly? startDateTo = null,
                [FromQuery] DateTime? createdAtFrom = null,
                [FromQuery] DateTime? createdAtTo = null,
                [FromQuery] bool? isActive = null
            ) =>
            {
                var result = await mediator.Send(new GetEnrollmentsQuery(
                    pageNumber,
                    pageSize,
                    isTrash,
                    startDateFrom,
                    startDateTo,
                    createdAtFrom,
                    createdAtTo,
                    isActive
                ), cancellationToken);
                return Results.Ok(result);
            })
            .WithName("GetEnrollments")
            .WithTags("Enrollments")
            .Produces<PagedResult<GetEnrollmentsResponse>>(StatusCodes.Status200OK)
            .WithSummary("Get a paged list of enrollments (Use ?isTrash=true for deleted items)");
        }
    }
}
