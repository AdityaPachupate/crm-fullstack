using System;
using MediatR;

namespace CRM.API.Features.Rejoin.GetRejoinById;

public record GetRejoinByIdQuery(Guid Id) : IRequest<GetRejoinByIdResponse>;
