using MediatR;

namespace CRM.API.Features.Lookups.UpdateLookup
{
    public record UpdateLookupCommand(UpdateLookupRequest Request) : IRequest<UpdateLookupResponse>;
}
