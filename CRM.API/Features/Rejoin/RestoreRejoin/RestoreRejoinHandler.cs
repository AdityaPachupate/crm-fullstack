using CRM.API.Common.Constants;
using CRM.API.Common.ExceptionHandling;
using CRM.API.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Net;

namespace CRM.API.Features.Rejoin.RestoreRejoin;

public class RestoreRejoinHandler(AppDbContext db, ILogger<RestoreRejoinHandler> logger) 
    : IRequestHandler<RestoreRejoinCommand, RestoreRejoinResponse>
{
    public async Task<RestoreRejoinResponse> Handle(RestoreRejoinCommand command, CancellationToken ct)
    {
        var record = await db.RejoinRecords.IgnoreQueryFilters().FirstOrDefaultAsync(r => r.Id == command.Request.Id, ct);
        if (record == null)
        {
            logger.LogWarning("{Message}: RejoinRecord {Id} not found.", LoggingMessages.NotFound, command.Request.Id);
            throw new BusinessException(LoggingMessages.NotFound, $"RejoinRecord {command.Request.Id} not found.", HttpStatusCode.NotFound);
        }

        if (!record.IsDeleted)
        {
            logger.LogWarning("{Message}: RejoinRecord {Id} is not currently deleted.", LoggingMessages.ValidationFailed, command.Request.Id);
            throw new BusinessException(LoggingMessages.ValidationFailed, $"RejoinRecord {command.Request.Id} is not deleted.", HttpStatusCode.BadRequest);
        }

        record.IsDeleted = false;
        record.DeletedAt = null;

        await db.Bills
            .IgnoreQueryFilters()
            .Where(b => b.RejoinRecordId == record.Id && b.IsDeleted)
            .ExecuteUpdateAsync(s => s
                .SetProperty(b => b.IsDeleted, false)
                .SetProperty(b => b.DeletedAt, (DateTime?)null), ct);

        await db.SaveChangesAsync(ct);
        logger.LogInformation("{Message}: RejoinRecord {Id} restored successfully.", LoggingMessages.ResourceUpdated, record.Id);

        return new RestoreRejoinResponse(true);
    }
}
