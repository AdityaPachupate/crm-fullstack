using MediatR;
using System;

namespace CRM.API.Features.Lookups.RestoreLookup
{
    public record RestoreLookupCommand(Guid Id) : IRequest<RestoreLookupResponse>;
}
