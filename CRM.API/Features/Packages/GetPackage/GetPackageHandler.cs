using System.Threading;
using System.Threading.Tasks;
using CRM.API.Infrastructure.Persistence;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using CRM.API.Common.ExceptionHandling;
using CRM.API.Common.Constants;
using CRM.API.Domain;
using System;

namespace CRM.API.Features.Packages.GetPackage
{
    public class GetPackageHandler(
        AppDbContext db,
        ILogger<GetPackageHandler> logger
    ) : IRequestHandler<GetPackageQuery, GetPackageResponse>
    {
        public async Task<GetPackageResponse> Handle(GetPackageQuery query, CancellationToken cancellationToken)
        {
            IQueryable<Package> queryable = query.IsTrash
                ? db.Packages.IgnoreQueryFilters().Where(p => p.IsDeleted)
                : db.Packages.AsQueryable();

            var package = await queryable
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == query.Id, cancellationToken);

            if (package == null)
            {
                logger.LogWarning("{Message}: Package with ID {PackageId} not found.", LoggingMessages.NotFound, query.Id);
                throw new BusinessException(
                    LoggingMessages.NotFound,
                    $"Retrieving Package with ID {query.Id}",
                    System.Net.HttpStatusCode.NotFound
                );
            }

            return package.Adapt<GetPackageResponse>();
        }
    }
}
