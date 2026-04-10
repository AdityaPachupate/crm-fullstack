using MediatR;
using System;

namespace CRM.API.Features.Lookups.DeleteLookup
{
    public record DeleteLookupCommand(Guid Id, bool IsPermanent) : IRequest<DeleteLookupResponse>;
}
