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
                ? queryable.Where(e => e.StartDate <= today && e.EndDate >= today)
                : queryable.Where(e => e.StartDate > today || e.EndDate < today);
        }

        // 2. Count and Setup Projection
        var totalCount = await queryable.CountAsync(cancellationToken);

        var config = new TypeAdapterConfig();
        config.NewConfig<Domain.Enrollment, GetEnrollmentsResponse>()
            .Map(dest => dest.IsActive, src => src.StartDate <= today && src.EndDate >= today);

        // 3. Page and Map
        var items = await queryable
            .OrderByDescending(e => e.CreatedAt)
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ProjectToType<GetEnrollmentsResponse>(config)
            .ToListAsync(cancellationToken);

        return new PagedResult<GetEnrollmentsResponse>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = query.PageNumber,
            PageSize = query.PageSize
        };
    }
}
