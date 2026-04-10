using CRM.API.Common.Constants;
using CRM.API.Common.ExceptionHandling;
using CRM.API.Infrastructure.Persistence;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Threading;
using System.Threading.Tasks;

namespace CRM.API.Features.Lookups.UpdateLookup
{
    public class UpdateLookupHandler(
        AppDbContext db,
        ILogger<UpdateLookupHandler> logger
    ) : IRequestHandler<UpdateLookupCommand, UpdateLookupResponse>
    {
        public async Task<UpdateLookupResponse> Handle(UpdateLookupCommand command, CancellationToken cancellationToken)
        {
            var lookup = await db.LookupValues
                .FirstOrDefaultAsync(l => l.Id == command.Request.Id && !l.IsDeleted, cancellationToken);

            if (lookup == null)
            {
                logger.LogWarning("Lookup with ID {LookupId} not found or is deleted.", command.Request.Id);
                throw new BusinessException(
                   LoggingMessages.NotFound,
                   $"Updating Lookup with ID {command.Request.Id}",
                   System.Net.HttpStatusCode.NotFound
               );
            }

            logger.LogInformation("Updating Lookup {LookupId} DisplayName from '{Old}' to '{New}'", lookup.Id, lookup.DisplayName, command.Request.DisplayName);
            
            lookup.DisplayName = command.Request.DisplayName;

            await db.SaveChangesAsync(cancellationToken);

            return lookup.Adapt<UpdateLookupResponse>();
        }
    }
}
