using CRM.API.Common.Constants;
using CRM.API.Common.ExceptionHandling;
using CRM.API.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace CRM.API.Features.Packages.RestorePackage
{
    public class RestorePackageHandler(
        AppDbContext db,
        ILogger<RestorePackageHandler> logger
    ) : IRequestHandler<RestorePackageCommand, RestorePackageResponse>
    {
        public async Task<RestorePackageResponse> Handle(RestorePackageCommand command, CancellationToken cancellationToken)
        {
            logger.LogInformation("Processing restore request for package ID: {PackageId}", command.Id);

            var package = await db.Packages
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync(p => p.Id == command.Id, cancellationToken);

            if (package == null)
            {
                logger.LogWarning("{Message}: Package with ID {PackageId} not found for restoration.", LoggingMessages.NotFound, command.Id);
                throw new BusinessException(
                   LoggingMessages.NotFound,
                   $"Restoring Package with ID {command.Id}",
                   System.Net.HttpStatusCode.NotFound
               );
            }

            package.IsDeleted = false;
            package.DeletedAt = null;

            await db.SaveChangesAsync(cancellationToken);
            
            logger.LogInformation("Package with ID {PackageId} restored successfully.", command.Id);
            
            return new RestorePackageResponse(true);
        }
    }
}
