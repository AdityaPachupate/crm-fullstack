using CRM.API.Common.Constants;
using CRM.API.Common.ExceptionHandling;
using CRM.API.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CRM.API.Features.Bills.RestoreBill;

public class RestoreBillHandler(AppDbContext db, ILogger<RestoreBillHandler> logger) 
    : IRequestHandler<RestoreBillCommand, RestoreBillResponse>
{
    public async Task<RestoreBillResponse> Handle(RestoreBillCommand command, CancellationToken cancellationToken)
    {
        var bill = await db.Bills
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(b => b.Id == command.Request.Id, cancellationToken);

        if (bill == null)
        {
            logger.LogWarning("{Message}: Restoring Bill with ID {BillId} not found", LoggingMessages.NotFound, command.Request.Id);
            throw new BusinessException(LoggingMessages.NotFound, $"Restoring Bill with ID {command.Request.Id}");
        }

        bill.IsDeleted = false;
        bill.DeletedAt = null;

        await db.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Bill with ID {BillId} restored successfully.", command.Request.Id);

        return new RestoreBillResponse(true);
    }
}
