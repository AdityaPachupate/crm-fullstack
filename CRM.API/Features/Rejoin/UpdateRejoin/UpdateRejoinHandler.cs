using CRM.API.Common.Constants;
using CRM.API.Common.ExceptionHandling;
using CRM.API.Domain;
using CRM.API.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Net;

namespace CRM.API.Features.Rejoin.UpdateRejoin;

public class UpdateRejoinHandler(
    AppDbContext db,
    ILogger<UpdateRejoinHandler> logger
) : IRequestHandler<UpdateRejoinCommand, UpdateRejoinResponse>
{
    public async Task<UpdateRejoinResponse> Handle(UpdateRejoinCommand command, CancellationToken ct)
    {
        var request = command.Request;

        var rejoinRecord = await db.RejoinRecords
                .Include(r => r.Package)
                .Include(r => r.Bill)
                .FirstOrDefaultAsync(r => r.Id == request.Id, ct);

        if (rejoinRecord == null)
        {
            logger.LogWarning("{Message}: RejoinRecord {Id} not found for update.", LoggingMessages.NotFound, request.Id);
            throw new BusinessException(LoggingMessages.NotFound, $"RejoinRecord {request.Id} not found", HttpStatusCode.NotFound);
        }

        if (request.LeadId.HasValue && request.LeadId != rejoinRecord.LeadId)
        {
            rejoinRecord.LeadId = request.LeadId.Value;
            if (rejoinRecord.Bill != null) rejoinRecord.Bill.LeadId = request.LeadId.Value;
        }

        bool packageChanged = false;
        if (request.PackageId.HasValue && request.PackageId != rejoinRecord.PackageId)
        {
            var newPackage = await db.Packages.FirstOrDefaultAsync(p => p.Id == request.PackageId.Value, ct);
            if (newPackage == null)
            {
                logger.LogWarning("{Message}: Package {PackageId} not found for RejoinRecord update.", LoggingMessages.NotFound, request.PackageId.Value);
                throw new BusinessException(LoggingMessages.NotFound, $"Package {request.PackageId.Value} not found", HttpStatusCode.NotFound);
            }

            rejoinRecord.PackageId = newPackage.Id;
            rejoinRecord.PackageCostSnapshot = newPackage.Cost;
            rejoinRecord.PackageDurationSnapshot = newPackage.DurationInDays;
            packageChanged = true;
        }

        rejoinRecord.PackageCostSnapshot = request.PackageCostSnapshot ?? rejoinRecord.PackageCostSnapshot;
        rejoinRecord.PackageDurationSnapshot = request.PackageDurationSnapshot ?? rejoinRecord.PackageDurationSnapshot;

        if (rejoinRecord.Bill != null)
        {
            rejoinRecord.Bill.InitialAmount = rejoinRecord.PackageCostSnapshot;
        }

        // Dates
        bool startDateChanged = request.StartDate.HasValue && request.StartDate != rejoinRecord.StartDate;
        rejoinRecord.StartDate = request.StartDate ?? rejoinRecord.StartDate;

        if (request.EndDate.HasValue)
        {
            rejoinRecord.EndDate = request.EndDate.Value;
        }
        else if (packageChanged || startDateChanged || request.PackageDurationSnapshot.HasValue)
        {
            rejoinRecord.EndDate = rejoinRecord.StartDate.AddDays(rejoinRecord.PackageDurationSnapshot);
        }

        await db.SaveChangesAsync(ct);
        logger.LogInformation("{Message}: RejoinRecord {RejoinRecordId} updated.", LoggingMessages.ResourceUpdated, rejoinRecord.Id);

        return new UpdateRejoinResponse(
            rejoinRecord.Id,
            rejoinRecord.LeadId,
            rejoinRecord.PackageId,
            rejoinRecord.StartDate,
            rejoinRecord.EndDate,
            rejoinRecord.PackageCostSnapshot,
            rejoinRecord.PackageDurationSnapshot,
            rejoinRecord.CreatedAt
        );
    }
}
