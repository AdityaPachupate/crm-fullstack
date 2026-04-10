using CRM.API.Common.Models;
using CRM.API.Infrastructure.Persistence;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CRM.API.Features.Lookups.GetLookups
{
    public class GetLookupsHandler(
        AppDbContext db,
        ILogger<GetLookupsHandler> logger
    ) : IRequestHandler<GetLookupsQuery, PagedResult<GetLookupsResponse>>
    {
        public async Task<PagedResult<GetLookupsResponse>> Handle(GetLookupsQuery query, CancellationToken cancellationToken)
        {
            logger.LogInformation("Fetching lookups (Page={Page}, Size={Size}, Category={Category})", query.PageNumber, query.PageSize, query.Category);

            var queryable = db.LookupValues
                .AsNoTracking()
                .Where(l => !l.IsDeleted);

            if (!string.IsNullOrEmpty(query.Category))
            {
                queryable = queryable.Where(l => l.Category == query.Category);
            }

            var totalCount = await queryable.CountAsync(cancellationToken);

            var items = await queryable
                .OrderBy(l => l.Category)
                .ThenBy(l => l.DisplayName)
                .Skip((query.PageNumber - 1) * query.PageSize)
                .Take(query.PageSize)
                .ProjectToType<GetLookupsResponse>()
                .ToListAsync(cancellationToken);

            return new PagedResult<GetLookupsResponse>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize
            };
        }
    }
}
