using System;
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

namespace CRM.API.Features.Lookups.AddLookup
{
    public class AddLookupHandler(
        AppDbContext db,
        ILogger<AddLookupHandler> logger
    ) : IRequestHandler<AddLookupCommand, AddLookupResponse>
    {
        public async Task<AddLookupResponse> Handle(AddLookupCommand command, CancellationToken cancellationToken)
        {
            logger.LogInformation("Adding a new lookup value: {Category} - {Code}", command.Request.Category, command.Request.Code);

            // Double check for Uniqueness (primary validation in FluentValidation)
            var alreadyExists = await db.LookupValues
                .AnyAsync(l => l.Category == command.Request.Category && l.Code == command.Request.Code, cancellationToken);
            
            if (alreadyExists)
            {
                logger.LogWarning("Lookup with Category '{Category}' and Code '{Code}' already exists.", command.Request.Category, command.Request.Code);
                throw new BusinessException(
                    LoggingMessages.Conflict,
                    $"Adding Lookup with code '{command.Request.Code}' in category '{command.Request.Category}'",
                    System.Net.HttpStatusCode.Conflict
                );
            }

            LookupValue lookup = command.Request.Adapt<LookupValue>();
            lookup.CreatedAt = DateTime.UtcNow;

            await db.LookupValues.AddAsync(lookup, cancellationToken);
            await db.SaveChangesAsync(cancellationToken);

            logger.LogInformation("Lookup added: {LookupId} - {Category}:{Code}", lookup.Id, lookup.Category, lookup.Code);

            return lookup.Adapt<AddLookupResponse>();
        }
    }
}
