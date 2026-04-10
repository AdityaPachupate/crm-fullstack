using CRM.API.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Features.Leads.GetLeadsById
{
    public class GetLeadByIdEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapGet("/leads/{id:guid}", async (Guid id, IMediator mediator, CancellationToken cancellationToken) =>
                Results.Ok(await mediator.Send(new GetLeadsByIdQuery(id), cancellationToken)))
            .WithName("GetLeadById")
            .WithTags("Leads")
            .Produces<GetLeadsByIdResponse>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status404NotFound)
            .WithSummary("Get a single lead by its unique standard ID");
        }
    }
}