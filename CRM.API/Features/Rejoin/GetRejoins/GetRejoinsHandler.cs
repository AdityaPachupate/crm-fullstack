using CRM.API.Common.Constants;
using CRM.API.Common.ExceptionHandling;
using CRM.API.Common.Models;
using CRM.API.Domain;
using CRM.API.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using Microsoft.Extensions.Logging;

namespace CRM.API.Features.Rejoin.GetRejoins;

public class GetRejoinsHandler(AppDbContext db, ILogger<GetRejoinsHandler> logger) : IRequestHandler<GetRejoinsQuery, PagedResult<GetRejoinsResponse>>
{
    public async Task<PagedResult<GetRejoinsResponse>> Handle(GetRejoinsQuery query, CancellationToken cancellationToken)
    {
        IQueryable<RejoinRecord> queryable = query.IsTrash 
            ? db.RejoinRecords.IgnoreQueryFilters().Where(r => r.IsDeleted)
            : db.RejoinRecords.AsQueryable();

        if (queryable == null)
        {
            logger.LogError("{Message}: Accessing the RejoinRecords collection returned null.", LoggingMessages.DatabaseError);
            throw new BusinessException(
                LoggingMessages.DatabaseError,
                "Accessing the RejoinRecords collection",
                System.Net.HttpStatusCode.InternalServerError
            );
        }

        var totalCount = await queryable.CountAsync(cancellationToken);

        var items = await queryable
            .Include(r => r.Lead)
            .Include(r => r.Package)
            .OrderByDescending(r => r.CreatedAt)
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(r => new GetRejoinsResponse(
                r.Id,
                r.LeadId,
                r.Lead != null ? r.Lead.Name : "N/A",
                r.PackageId,
                r.Package != null ? r.Package.Name : "N/A",
                r.PackageCostSnapshot,
                r.PackageDurationSnapshot,
                r.StartDate,
                r.EndDate,
                r.CreatedAt,
                r.IsDeleted
            ))
            .ToListAsync(cancellationToken);

        return new PagedResult<GetRejoinsResponse>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = query.PageNumber,
            PageSize = query.PageSize
        };
    }
}
