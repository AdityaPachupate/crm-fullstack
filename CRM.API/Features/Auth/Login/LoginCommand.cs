using MediatR;

namespace CRM.API.Features.Auth.Login
{
    public record LoginCommand(LoginRequest Request) : IRequest<LoginResponse>;
}
