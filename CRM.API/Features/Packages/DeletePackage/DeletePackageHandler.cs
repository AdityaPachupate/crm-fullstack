using CRM.API.Common.Constants;
using CRM.API.Common.ExceptionHandling;
using CRM.API.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace CRM.API.Features.Packages.DeletePackage
{
    public class DeletePackageHandler(
        AppDbContext db,
        ILogger<DeletePackageHandler> logger
    ) : IRequestHandler<DeletePackageCommand, DeletePackageResponse>
    {
        public async Task<DeletePackageResponse> Handle(DeletePackageCommand command, CancellationToken cancellationToken)
        {
            logger.LogInformation("Processing delete request for package ID: {PackageId} (Permanent: {IsPermanent})", command.Id, command.IsPermanent);

            var package = await db.Packages
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync(p => p.Id == command.Id, cancellationToken);

            if (package == null)
            {
                logger.LogWarning("{Message}: Package with ID {PackageId} not found for deletion.", LoggingMessages.NotFound, command.Id);
                throw new BusinessException(
                   LoggingMessages.NotFound,
                   $"Deleting Package with ID {command.Id}",
                   System.Net.HttpStatusCode.NotFound
               );
            }

            if (command.IsPermanent)
            {
                db.Packages.Remove(package);
                logger.LogInformation("Package with ID {PackageId} deleted permanently.", command.Id);
            }
            else
            {
                package.IsDeleted = true;
                package.DeletedAt = DateTime.UtcNow;
                logger.LogInformation("Package with ID {PackageId} moved to Trash.", command.Id);
            }

            await db.SaveChangesAsync(cancellationToken);
            return new DeletePackageResponse(true);
        }
    }
}
