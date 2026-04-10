using System;

namespace CRM.API.Features.Lookups.UpdateLookup
{
    public record UpdateLookupResponse(Guid Id, string Category, string Code, string DisplayName);
}
