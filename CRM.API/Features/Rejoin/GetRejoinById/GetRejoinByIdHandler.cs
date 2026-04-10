using CRM.API.Common.Constants;
using CRM.API.Common.ExceptionHandling;
using CRM.API.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using Microsoft.Extensions.Logging;

namespace CRM.API.Features.Rejoin.GetRejoinById;

public class GetRejoinByIdHandler(AppDbContext db, ILogger<GetRejoinByIdHandler> logger) : IRequestHandler<GetRejoinByIdQuery, GetRejoinByIdResponse>
{
    public async Task<GetRejoinByIdResponse> Handle(GetRejoinByIdQuery query, CancellationToken cancellationToken)
    {
        var record = await db.RejoinRecords
            .AsNoTracking()
            .Where(r => r.Id == query.Id)
            .Select(r => new GetRejoinByIdResponse(
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
                r.IsDeleted,
                r.DeletedAt,
                r.Bill != null ? new RejoinBillDto(
                    r.Bill.Id,
                    r.Bill.InitialAmount,
                    r.Bill.AmountPaid,
                    r.Bill.PendingAmount,
                    r.Bill.MedicineBillingAmount,
                    r.Bill.CreatedAt
                ) : null
            ))
            .SingleOrDefaultAsync(cancellationToken);

        if (record == null)
        {
            logger.LogWarning("{Message}: Fetching RejoinRecord with ID {Id} not found", LoggingMessages.NotFound, query.Id);
            throw new BusinessException(
                LoggingMessages.NotFound,
                $"Fetching RejoinRecord with ID {query.Id}",
                System.Net.HttpStatusCode.NotFound
            );
        }

        return record;
    }
}
