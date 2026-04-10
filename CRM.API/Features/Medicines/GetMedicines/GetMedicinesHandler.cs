using CRM.API.Common.Models;
using CRM.API.Infrastructure.Persistence;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CRM.API.Features.Medicines.GetMedicines
{
    public class GetMedicinesHandler(
        AppDbContext db,
        ILogger<GetMedicinesHandler> logger
    ) : IRequestHandler<GetMedicinesQuery, PagedResult<GetMedicinesResponse>>
    {
        public async Task<PagedResult<GetMedicinesResponse>> Handle(GetMedicinesQuery query, CancellationToken ct)
        {
            logger.LogInformation("Fetching medicines (Page={Page}, Size={Size}, Search={Search})", query.PageNumber, query.PageSize, query.SearchTerm);
            var queryable = db.Medicines.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(query.SearchTerm))
            {
                queryable = queryable.Where(m => m.Name.Contains(query.SearchTerm));
            }

            var totalCount = await queryable.CountAsync(ct);

            var items = await queryable
                .OrderBy(m => m.Name)
                .Skip((query.PageNumber - 1) * query.PageSize)
                .Take(query.PageSize)
                .ProjectToType<GetMedicinesResponse>()
                .ToListAsync(ct);

            return new PagedResult<GetMedicinesResponse>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize
            };
        }
    }
}
