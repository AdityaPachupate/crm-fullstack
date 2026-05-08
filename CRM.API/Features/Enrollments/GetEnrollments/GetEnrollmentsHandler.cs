namespace CRM.API.Features.Enrollments.GetEnrollments;

using CRM.API.Common.Models;
using CRM.API.Infrastructure.Persistence;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

public class GetEnrollmentsHandler(AppDbContext db) : IRequestHandler<GetEnrollmentsQuery, PagedResult<GetEnrollmentsResponse>>
{
    public async Task<PagedResult<GetEnrollmentsResponse>> Handle(GetEnrollmentsQuery query, CancellationToken cancellationToken)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow.Date);

        var queryable = (query.IsTrash
            ? db.Enrollments.IgnoreQueryFilters().Where(e => e.IsDeleted)
            : db.Enrollments.AsQueryable())
            .AsNoTracking();

        // 1. Apply Filters
        if (query.StartDateFrom.HasValue)
            queryable = queryable.Where(e => e.StartDate >= query.StartDateFrom.Value);

        if (query.StartDateTo.HasValue)
            queryable = queryable.Where(e => e.StartDate <= query.StartDateTo.Value);

        if (query.CreatedAtFrom.HasValue)
            queryable = queryable.Where(e => e.CreatedAt >= query.CreatedAtFrom.Value);

        if (query.CreatedAtTo.HasValue)
            queryable = queryable.Where(e => e.CreatedAt <= query.CreatedAtTo.Value);

        if (query.IsActive.HasValue)
        {
            queryable = query.IsActive.Value
                ? queryable.Where(e => e.StartDate <= today && e.EndDate >= today) // Active: Started and not yet finished
                : queryable.Where(e => e.EndDate < today);                         // Expired: End date is in the past
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var searchTerm = $"%{query.Search}%";
            queryable = queryable.Where(e => 
                EF.Functions.ILike(e.Lead.Name, searchTerm) || 
                EF.Functions.ILike(e.Lead.Phone, searchTerm));
        }

        if (query.PackageId.HasValue)
        {
            queryable = queryable.Where(e => e.PackageId == query.PackageId.Value);
        }

        if (query.IsPending.HasValue)
        {
            queryable = query.IsPending.Value
                ? queryable.Where(e => e.Bill != null && e.Bill.PendingAmount > 0)
                : queryable.Where(e => e.Bill == null || e.Bill.PendingAmount <= 0);
        }

        // 2. Sorting
        queryable = query.SortBy switch
        {
            "date-asc" => queryable.OrderBy(e => e.CreatedAt),
            "date-desc" => queryable.OrderByDescending(e => e.CreatedAt),
            "pending-high" => queryable.OrderByDescending(e => e.Bill == null ? 0 : e.Bill.PendingAmount),
            "pending-low" => queryable.OrderBy(e => e.Bill == null ? 0 : e.Bill.PendingAmount),
            _ => queryable.OrderByDescending(e => e.CreatedAt)
        };

        // 3. Count and Setup Projection
        var totalCount = await queryable.CountAsync(cancellationToken);

        // 4. Page and Map
        var dbItems = await queryable
            .Include(e => e.Lead)
            .Include(e => e.Package)
            .Include(e => e.Bill)
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        var items = dbItems.Select(e => new GetEnrollmentsResponse(
                e.Id,
                e.Lead.Name,
                e.Lead.Phone,
                e.Package.Name,
                e.PackageCostSnapshot,
                e.Bill != null ? e.Bill.PendingAmount : 0,
                e.StartDate,
                e.EndDate,
                e.CreatedAt,
                e.StartDate <= today && e.EndDate >= today,
                e.EndDate < today ? "Expired" : e.StartDate > today ? "Scheduled" : "Active"
            )).ToList();

        return new PagedResult<GetEnrollmentsResponse>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = query.PageNumber,
            PageSize = query.PageSize
        };
    }
}
