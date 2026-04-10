using MediatR;

namespace CRM.API.Features.Rejoin.CreateRejoin;

public record CreateRejoinCommand(CreateRejoinRequest Request) : IRequest<CreateRejoinResponse>;
