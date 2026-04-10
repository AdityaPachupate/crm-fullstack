using CRM.API.Common.Models;
using MediatR;
using System.Collections.Generic;

namespace CRM.API.Features.Lookups.GetLookups
{
    public record GetLookupsQuery(
        int PageNumber = 1,
        int PageSize = 10,
        string? Category = null
    ) : IRequest<PagedResult<GetLookupsResponse>>;
}
