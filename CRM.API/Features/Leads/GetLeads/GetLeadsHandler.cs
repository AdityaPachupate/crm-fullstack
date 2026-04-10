namespace CRM.API.Features.Leads.GetLeads
{
    using CRM.API.Common.Constants;
    using CRM.API.Common.ExceptionHandling;
    using CRM.API.Common.Models;
    using CRM.API.Domain;
    using CRM.API.Infrastructure.Persistence;
    using MediatR;
    using Microsoft.EntityFrameworkCore;
    using System.Linq;

    public class GetLeadsHandler(AppDbContext db) : IRequestHandler<GetLeadsQuery, PagedResult<GetLeadsResponse>>
    {
        public async Task<PagedResult<GetLeadsResponse>> Handle(GetLeadsQuery query, CancellationToken cancellationToken)
        {
            IQueryable<Lead> queryableLeads = query.IsTrash 
                ? db.Leads.IgnoreQueryFilters().Where(l => l.IsDeleted)
                : db.Leads.AsQueryable();

            if (queryableLeads == null)
            {
                throw new BusinessException(
                    LoggingMessages.DatabaseError,
                    "Accessing the Leads collection",
                    System.Net.HttpStatusCode.InternalServerError
                );
            }

            // Standard Filters
            if (query.Status.HasValue)
            {
                queryableLeads = queryableLeads.Where(l => l.Status == query.Status.Value);
            }

            if (!string.IsNullOrEmpty(query.Source))
            {
                queryableLeads = queryableLeads.Where(l => l.Source == query.Source);
            }

            // Analytics Filters
            if (query.HasEnrollment.HasValue)
            {
                queryableLeads = queryableLeads.Where(l => l.Enrollments.Any() == query.HasEnrollment.Value);
            }

            if (query.HasMedicine.HasValue)
            {
                queryableLeads = queryableLeads.Where(l => l.Bills.Any(b => b.Items.Any()) == query.HasMedicine.Value);
            }

            var totalCount = await queryableLeads.CountAsync(cancellationToken);

            var items = await queryableLeads
                .OrderByDescending(l => l.CreatedAt)
                .Skip((query.PageNumber - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(l => new GetLeadsResponse(
                    l.Id,
                    l.Name,
                    l.Phone,
                    l.Status,
                    l.Source,
                    l.Reason,
                    l.CreatedAt,
                    l.UpdatedAt,
                    l.Enrollments.Any(),
                    l.Bills.Any(b => b.Items.Any())
                ))
                .ToListAsync(cancellationToken);

            return new PagedResult<GetLeadsResponse>
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = query.PageNumber,
                PageSize = query.PageSize
            };
        }
    }
}
