using MediatR;

namespace CRM.API.Features.Rejoin.UpdateRejoin;

public record UpdateRejoinCommand(UpdateRejoinRequest Request) : IRequest<UpdateRejoinResponse>;
