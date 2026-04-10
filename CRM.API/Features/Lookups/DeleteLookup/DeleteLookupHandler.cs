using CRM.API.Common.Constants;
using CRM.API.Common.ExceptionHandling;
using CRM.API.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CRM.API.Features.Lookups.DeleteLookup
{
    public class DeleteLookupHandler(
        AppDbContext db,
        ILogger<DeleteLookupHandler> logger
    ) : IRequestHandler<DeleteLookupCommand, DeleteLookupResponse>
    {
        public async Task<DeleteLookupResponse> Handle(DeleteLookupCommand command, CancellationToken cancellationToken)
        {
            logger.LogInformation("Processing delete request for lookup ID: {LookupId} (Permanent: {IsPermanent})", command.Id, command.IsPermanent);

            var lookup = await db.LookupValues
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync(l => l.Id == command.Id, cancellationToken);

            if (lookup == null)
            {
                logger.LogWarning("Lookup with ID {LookupId} not found for deletion.", command.Id);
                throw new BusinessException(
                   LoggingMessages.NotFound,
                   $"Deleting Lookup with ID {command.Id}",
                   System.Net.HttpStatusCode.NotFound
               );
            }

            if (command.IsPermanent)
            {
                db.LookupValues.Remove(lookup);
                logger.LogInformation("Lookup with ID {LookupId} deleted permanently.", command.Id);
            }
            else
            {
                lookup.IsDeleted = true;
                lookup.DeletedAt = DateTime.UtcNow;
                logger.LogInformation("Lookup with ID {LookupId} soft deleted (moved to trash).", command.Id);
            }

            await db.SaveChangesAsync(cancellationToken);
            return new DeleteLookupResponse(true);
        }
    }
}
