using CRM.API.Common.Constants;
using CRM.API.Common.ExceptionHandling;
using CRM.API.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Threading;
using System.Threading.Tasks;

namespace CRM.API.Features.Lookups.RestoreLookup
{
    public class RestoreLookupHandler(AppDbContext db, ILogger<RestoreLookupHandler> logger) : IRequestHandler<RestoreLookupCommand, RestoreLookupResponse>
    {
        public async Task<RestoreLookupResponse> Handle(RestoreLookupCommand command, CancellationToken ct)
        {
            var lookup = await db.LookupValues
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(l => l.Id == command.Id, ct);

            if (lookup == null)
            {
                logger.LogWarning("{Message}: Restoring Lookup with ID {LookupId} not found", LoggingMessages.NotFound, command.Id);
                throw new BusinessException(
                    LoggingMessages.NotFound,
                    $"Lookup with ID {command.Id} not found.",
                    System.Net.HttpStatusCode.NotFound
                );
            }

            if (!lookup.IsDeleted)
            {
                logger.LogWarning("{Message}: Restoring Lookup with ID {LookupId} is not deleted", LoggingMessages.ValidationFailed, command.Id);
                throw new BusinessException(
                    LoggingMessages.ValidationFailed,
                    $"Lookup with ID {command.Id} is not deleted.",
                    System.Net.HttpStatusCode.BadRequest
                );
            }

            lookup.IsDeleted = false;
            lookup.DeletedAt = null;

            await db.SaveChangesAsync(ct);
            logger.LogInformation("{Message}: Lookup {LookupId} restored", LoggingMessages.ResourceUpdated, command.Id);
            return new RestoreLookupResponse(true);
        }
    }
}
