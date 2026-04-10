using System.Threading;
using System.Threading.Tasks;
using CRM.API.Domain;
using CRM.API.Infrastructure.Persistence;
using Mapster;
using MediatR;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using CRM.API.Common.ExceptionHandling;
using CRM.API.Common.Constants;
using System;

namespace CRM.API.Features.Packages.CreatePackage
{
    public class CreatePackageHandler(
        AppDbContext db,
        ILogger<CreatePackageHandler> logger
    ) : IRequestHandler<CreatePackageCommand, CreatePackageResponse>
    {
        public async Task<CreatePackageResponse> Handle(CreatePackageCommand command, CancellationToken cancellationToken)
        {
            logger.LogInformation("Creating package with name: {PackageName}", command.Request.Name);

            // Uniqueness check for Name
            var alreadyExists = await db.Packages
                .AnyAsync(p => p.Name == command.Request.Name && !p.IsDeleted, cancellationToken);

            if (alreadyExists)
            {
                logger.LogWarning("{Message}: Package with name {PackageName} already exists.", LoggingMessages.Conflict, command.Request.Name);
                throw new BusinessException(
                    LoggingMessages.Conflict,
                    $"Creating Package with name '{command.Request.Name}'",
                    System.Net.HttpStatusCode.Conflict
                );
            }

            Package package = command.Request.Adapt<Package>();
            package.CreatedAt = DateTime.UtcNow;

            await db.Packages.AddAsync(package, cancellationToken);
            await db.SaveChangesAsync(cancellationToken);

            logger.LogInformation("Package created: {PackageId} - {PackageName}", package.Id, package.Name);

            return package.Adapt<CreatePackageResponse>();
        }
    }
}