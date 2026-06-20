using CRM.API.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CRM.API.Features.Auth.Login
{
    public class LoginEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPost("/auth/login", async (
                LoginRequest request, IMediator mediator, CancellationToken cancellationToken
            ) =>
            {
                var result = await mediator.Send(new LoginCommand(request), cancellationToken);
                return Results.Ok(result);
            })
            .WithName("Login")
            .WithTags("Auth")
            .Produces<LoginResponse>(StatusCodes.Status200OK)
            .Produces<ProblemDetails>(StatusCodes.Status401Unauthorized)
            .Produces<ProblemDetails>(StatusCodes.Status400BadRequest)
            .WithSummary("Authenticate and get a token");
        }
    }
}
