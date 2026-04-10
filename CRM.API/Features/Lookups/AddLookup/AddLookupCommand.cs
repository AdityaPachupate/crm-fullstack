using MediatR;

namespace CRM.API.Features.Lookups.AddLookup
{
    public record AddLookupCommand(AddLookupRequest Request) : IRequest<AddLookupResponse>;
}
