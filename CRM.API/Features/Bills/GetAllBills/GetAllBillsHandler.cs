using CRM.API.Common.Models;
using CRM.API.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CRM.API.Features.Bills.GetAllBills;

public class GetAllBillsHandler(AppDbContext db) : IRequestHandler<GetAllBillsQuery, PagedResult<GetAllBillsResponse>>
{
    public async Task<PagedResult<GetAllBillsResponse>> Handle(GetAllBillsQuery query, CancellationToken cancellationToken)
    {
        var request = query.Request;

        // Base query with optional Trash filter
        var baseQuery = request.IsTrash 
            ? db.Bills.IgnoreQueryFilters().Where(b => b.IsDeleted)
            : db.Bills.AsQueryable();

        // Optional filtering by Lead
        if (request.LeadId.HasValue)
        {
            baseQuery = baseQuery.Where(b => b.LeadId == request.LeadId.Value);
        }

        var totalCount = await baseQuery.CountAsync(cancellationToken);

        var items = await baseQuery
            .AsNoTracking()
            .OrderByDescending(b => b.CreatedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(b => new GetAllBillsResponse(
                b.Id,
                b.LeadId,
                b.Lead.Name,
                b.InitialAmount,
                b.MedicineBillingAmount,
                b.AmountPaid,
                b.PendingAmount,
                b.CreatedAt,
                b.IsDeleted
            ))
            .ToListAsync(cancellationToken);

        return new PagedResult<GetAllBillsResponse>
        {
            Items = items,
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };
    }
}