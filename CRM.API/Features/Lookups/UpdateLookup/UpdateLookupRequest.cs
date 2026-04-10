using System;

namespace CRM.API.Features.Lookups.UpdateLookup
{
    public record UpdateLookupRequest(Guid Id, string DisplayName);
}
