using System;
using MediatR;

namespace CRM.API.Features.Rejoin.RestoreRejoin;

public record RestoreRejoinCommand(RestoreRejoinRequest Request) : IRequest<RestoreRejoinResponse>;
