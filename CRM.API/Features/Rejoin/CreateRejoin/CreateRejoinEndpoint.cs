using CRM.API.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;

namespace CRM.API.Features.Rejoin.CreateRejoin;

public class CreateRejoinEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/rejoins", async ([FromBody] CreateRejoinRequest request, IMediator mediator, CancellationToken cancellationToken) =>
        {
            var command = new CreateRejoinCommand(request);
            var result = await mediator.Send(command, cancellationToken);
            return Results.Created($"/rejoins/{result.Id}", result);
        })
        .WithName("CreateRejoin")
        .WithTags("Rejoins")
        .Produces<CreateRejoinResponse>(StatusCodes.Status201Created)
        .Produces<Microsoft.AspNetCore.Mvc.ProblemDetails>(StatusCodes.Status400BadRequest)
        .Produces<Microsoft.AspNetCore.Mvc.ProblemDetails>(StatusCodes.Status404NotFound)
        .WithSummary("Create a rejoin record for a lead returning to a package");
    }
}
