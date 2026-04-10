using System;
using System.Threading;
using System.Threading.Tasks;
using CRM.API.Common.Constants;
using CRM.API.Common.ExceptionHandling;
using CRM.API.Domain;
using CRM.API.Infrastructure.Persistence;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CRM.API.Features.Packages.UpdatePackage
{
    public class UpdatePackageHandler(
        AppDbContext db,
        ILogger<UpdatePackageHandler> logger
    ) : IRequestHandler<UpdatePackageCommand, UpdatePackageResponse>
    {
        public async Task<UpdatePackageResponse> Handle(UpdatePackageCommand command, CancellationToken cancellationToken)
        {
            var package = await db.Packages
                .FirstOrDefaultAsync(p => p.Id == command.Id && !p.IsDeleted, cancellationToken);

            if (package == null)
            {
                logger.LogWarning("{Message}: Package with ID {PackageId} not found.", LoggingMessages.NotFound, command.Id);
                throw new BusinessException(
                    LoggingMessages.NotFound,
                    $"Updating Package with ID {command.Id}",
                    System.Net.HttpStatusCode.NotFound
                );
            }

            // Uniqueness check if name is being changed
            if (!string.Equals(package.Name, command.Request.Name, StringComparison.OrdinalIgnoreCase))
            {
                var nameExists = await db.Packages
                    .AnyAsync(p => p.Name == command.Request.Name && !p.IsDeleted, cancellationToken);

                if (nameExists)
                {
                    logger.LogWarning("{Message}: Package with name {PackageName} already exists.", LoggingMessages.Conflict, command.Request.Name);
                    throw new BusinessException(
                        LoggingMessages.Conflict,
                        $"Updating Package Name to '{command.Request.Name}'",
                        System.Net.HttpStatusCode.Conflict
                    );
                }
            }

            // Update fields
            command.Request.Adapt(package);
            package.UpdatedAt = DateTime.UtcNow;

            await db.SaveChangesAsync(cancellationToken);

            logger.LogInformation("Package updated: {PackageId} - {PackageName}", package.Id, package.Name);

            return package.Adapt<UpdatePackageResponse>();
        }
    }
}
