using CRM.API.Common.Constants;
using CRM.API.Common.ExceptionHandling;
using CRM.API.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CRM.API.Features.FollowUps.RestoreFollowUp
{
    public class RestoreFollowUpHandler(
        AppDbContext db,
        ILogger<RestoreFollowUpHandler> logger
    ) :
    IRequestHandler<RestoreFollowUpCommand, RestoreFollowUpResponse>
    {
        public async Task<RestoreFollowUpResponse> Handle(RestoreFollowUpCommand command, CancellationToken cancellationToken)
        {
            var followUp = await db.FollowUps
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(f => f.Id == command.Request.Id, cancellationToken);

            if (followUp == null)
            {
                logger.LogWarning("{Message}: Restoring FollowUp {FollowUpId} not found", LoggingMessages.NotFound, command.Request.Id);
                throw new BusinessException(
                   LoggingMessages.NotFound,
                   $"FollowUp with ID {command.Request.Id} not found",
                   System.Net.HttpStatusCode.NotFound
               );
            }

            followUp.IsDeleted = false;
            followUp.DeletedAt = null;

            await db.SaveChangesAsync(cancellationToken);

            logger.LogInformation("Follow-Up with ID {FollowUpId} restored correctly.", command.Request.Id);

            return new RestoreFollowUpResponse(true);
        }
    }
}