using System;

namespace CRM.API.Features.Lookups.AddLookup
{
    public record AddLookupResponse(Guid Id, string Category, string Code, string DisplayName, DateTime CreatedAt);
}
