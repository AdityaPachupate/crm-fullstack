using CRM.API.Common.Constants;
using CRM.API.Common.ExceptionHandling;
using CRM.API.Common.Interfaces;
using CRM.API.Infrastructure.Persistence;
using MediatR;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace CRM.API.Features.Rejoin.DeleteRejoin;

public class DeleteRejoinHandler(AppDbContext db, IBillRepository billRepository, ILogger<DeleteRejoinHandler> logger) 
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
            // Detach the bill so it remains active for the lead but unlinked before the rejoin record is permanently wiped.
            // This ensures financial analysis remains accurate even after a hard delete.
            await billRepository.DetachBillFromRejoinAsync(record.Id, ct);

            db.RejoinRecords.Remove(record);
            logger.LogInformation("{Message}: RejoinRecord {Id} hard deleted. Bill detached and preserved.", LoggingMessages.ResourceUpdated, record.Id);
        }
        else
        {
            // Soft Delete
            record.IsDeleted = true;
            record.DeletedAt = DateTime.UtcNow;

            // Detach the bill so it remains active for the lead but unlinked from the trashed rejoin record.
            // This preserves the financial record for analysis.
            await billRepository.DetachBillFromRejoinAsync(record.Id, ct);

            logger.LogInformation("{Message}: RejoinRecord {Id} trashed. Bill detached but preserved.", LoggingMessages.ResourceUpdated, record.Id);
        }

        await db.SaveChangesAsync(ct);
        return new DeleteRejoinResponse(true);
    }
}
