using CRM.API.Common.Constants;
using CRM.API.Common.ExceptionHandling;
using CRM.API.Infrastructure.Persistence;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CRM.API.Features.Leads.GetLeadsById
{
    public class GetLeadsByIdHandler(AppDbContext db) : IRequestHandler<GetLeadsByIdQuery, GetLeadsByIdResponse>
    {
        public async Task<GetLeadsByIdResponse> Handle(GetLeadsByIdQuery query, CancellationToken cancellationToken)
        {
            var lead = await db.Leads
                .AsNoTracking()
                .AsSplitQuery()
                .Where(l => l.Id == query.Id)
                .Select(l => new GetLeadsByIdResponse(
                    l.Id,
                    l.Name,
                    l.Phone,
                    l.Status,
                    l.Source,
                    l.Reason,
                    l.CreatedAt,
                    l.UpdatedAt,
                    l.FollowUps.Select(f => new FollowUpDto(
                        f.Id,
                        f.FollowUpDate,
                        f.Notes,
                        f.Source,
                        f.Priority,
                        f.Status,
                        f.CreatedAt,
                        f.CompletedAt
                    )).ToList(),
                    l.Enrollments.Select(e => new EnrollmentDto(
                        e.Id,
                        e.PackageId,
                        e.Package != null ? e.Package.Name : "N/A",
                        e.PackageCostSnapshot,
                        e.PackageDurationSnapshot,
                        e.StartDate,
                        e.EndDate,
                        e.CreatedAt,
                        e.Bill != null ? new BillDto(
                            e.Bill.Id,
                            e.Bill.InitialAmount,
                            e.Bill.AmountPaid,
                            e.Bill.PendingAmount,
                            e.Bill.MedicineBillingAmount,
                            e.Bill.CreatedAt
                        ) : null
                    )).ToList(),
                    l.RejoinRecords.Select(r => new RejoinRecordDto(
                        r.Id,
                        r.PackageId,
                        r.Package != null ? r.Package.Name : "N/A",
                        r.PackageCostSnapshot,
                        r.PackageDurationSnapshot,
                        r.StartDate,
                        r.EndDate,
                        r.CreatedAt,
                        r.Bill != null ? new BillDto(
                            r.Bill.Id,
                            r.Bill.InitialAmount,
                            r.Bill.AmountPaid,
                            r.Bill.PendingAmount,
                            r.Bill.MedicineBillingAmount,
                            r.Bill.CreatedAt
                        ) : null
                    )).ToList()
                ))
                .SingleOrDefaultAsync(cancellationToken);

            if (lead == null)
            {
                throw new BusinessException(
                    LoggingMessages.NotFound,
                    $"Fetching lead with ID {query.Id}",
                    System.Net.HttpStatusCode.NotFound
                );
            }

            return lead;
        }
    }
}