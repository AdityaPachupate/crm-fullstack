using CRM.API.Common.Constants;
using CRM.API.Common.ExceptionHandling;
using CRM.API.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CRM.API.Features.Leads.RestoreLead;

public class RestoreLeadHandler(AppDbContext db, ILogger<RestoreLeadHandler> logger) 
    : IRequestHandler<RestoreLeadCommand, RestoreLeadResponse>
{
    public async Task<RestoreLeadResponse> Handle(RestoreLeadCommand command, CancellationToken cancellationToken)
    {
        // 1. Find the lead (must use IgnoreQueryFilters since it's "deleted")
        var lead = await db.Leads
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(l => l.Id == command.Request.Id, cancellationToken);

        if (lead == null)
            throw new BusinessException(LoggingMessages.NotFound, "Restoring Lead");

        // 2. Bring it back from the trash
        lead.IsDeleted = false;
        lead.DeletedAt = null;

        // Cascade Restore to related entities (that were previously soft-deleted)
        await db.Bills
            .IgnoreQueryFilters()
            .Where(b => b.LeadId == lead.Id && b.IsDeleted)
            .ExecuteUpdateAsync(s => s
                .SetProperty(b => b.IsDeleted, false)
                .SetProperty(b => b.DeletedAt, (DateTime?)null), cancellationToken);

        await db.Enrollments
            .IgnoreQueryFilters()
            .Where(e => e.LeadId == lead.Id && e.IsDeleted)
            .ExecuteUpdateAsync(s => s
                .SetProperty(e => e.IsDeleted, false)
                .SetProperty(e => e.DeletedAt, (DateTime?)null), cancellationToken);

        await db.FollowUps
            .IgnoreQueryFilters()
            .Where(f => f.LeadId == lead.Id && f.IsDeleted)
            .ExecuteUpdateAsync(s => s
                .SetProperty(f => f.IsDeleted, false)
                .SetProperty(f => f.DeletedAt, (DateTime?)null), cancellationToken);

        await db.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Lead with ID {LeadId} restored correctly.", command.Request.Id);

        return new RestoreLeadResponse(true);
    }
}
