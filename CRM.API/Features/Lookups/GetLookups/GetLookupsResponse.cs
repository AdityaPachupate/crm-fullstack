using System;

namespace CRM.API.Features.Lookups.GetLookups
{
    public record GetLookupsResponse(Guid Id, string Category, string Code, string DisplayName);
}
