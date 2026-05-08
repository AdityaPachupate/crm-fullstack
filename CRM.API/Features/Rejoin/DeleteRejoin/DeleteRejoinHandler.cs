using CRM.API.Common.Constants;
using CRM.API.Common.ExceptionHandling;
using CRM.API.Common.Interfaces;
using CRM.API.Infrastructure.Persistence;
using MediatR;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace CRM.API.Features.Rejoin.DeleteRejoin;

public class DeleteRejoinHandler(AppDbContext db, ILogger<DeleteRejoinHandler> logger) 
    : IRequestHandler<DeleteRejoinCommand, DeleteRejoinResponse>
{
    public async Task<DeleteRejoinResponse> Handle(DeleteRejoinCommand command, CancellationToken ct)
    {
        var record = await db.RejoinRecords
            .Include(r => r.Bill)
            .ThenInclude(b => b!.Items)
            .FirstOrDefaultAsync(r => r.Id == command.Request.Id, ct);

        if (record == null)
        {
            logger.LogWarning("{Message}: RejoinRecord {Id} not found.", LoggingMessages.NotFound, command.Request.Id);
            throw new BusinessException(LoggingMessages.NotFound, $"RejoinRecord {command.Request.Id} not found.", HttpStatusCode.NotFound);
        }

        if (command.Request.IsPermanent)
        {
            // Permanent Delete
            if (record.Bill != null)
            {
                db.Bills.Remove(record.Bill);
            }

            db.RejoinRecords.Remove(record);
            logger.LogInformation("{Message}: RejoinRecord {Id} and its bill hard deleted.", LoggingMessages.ResourceUpdated, record.Id);
        }
        else
        {
            // Soft Delete
            record.IsDeleted = true;
            record.DeletedAt = DateTime.UtcNow;

            // Soft delete the bill as well so it doesn't count towards the total due
            if (record.Bill != null)
            {
                record.Bill.IsDeleted = true;
                record.Bill.DeletedAt = DateTime.UtcNow;
            }

            logger.LogInformation("{Message}: RejoinRecord {Id} and its bill trashed.", LoggingMessages.ResourceUpdated, record.Id);
        }

        await db.SaveChangesAsync(ct);
        return new DeleteRejoinResponse(true);
    }
}
