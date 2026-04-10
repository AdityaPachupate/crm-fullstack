using System;
using MediatR;

namespace CRM.API.Features.Rejoin.DeleteRejoin;

public record DeleteRejoinCommand(DeleteRejoinRequest Request) : IRequest<DeleteRejoinResponse>;
