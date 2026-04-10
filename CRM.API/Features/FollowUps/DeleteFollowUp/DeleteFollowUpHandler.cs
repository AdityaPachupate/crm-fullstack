using CRM.API.Common.Constants;
using CRM.API.Common.ExceptionHandling;
using CRM.API.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CRM.API.Features.FollowUps.DeleteFollowUp
{
    public class DeleteFollowUpHandler(
        AppDbContext db,
        ILogger<DeleteFollowUpHandler> logger
    ) : IRequestHandler<DeleteFollowUpCommand, DeleteFollowUpResponse>
    {
        public async Task<DeleteFollowUpResponse> Handle(DeleteFollowUpCommand command, CancellationToken cancellationToken)
        {
            var followUp = await db.FollowUps
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync(f => f.Id == command.Request.Id, cancellationToken);

            if (followUp == null)
            {
                logger.LogWarning("{Message}: Deleting FollowUp {FollowUpId} not found", LoggingMessages.NotFound, command.Request.Id);
                throw new BusinessException(
                   LoggingMessages.NotFound,
                   $"FollowUp with ID {command.Request.Id} not found",
                   System.Net.HttpStatusCode.NotFound
               );
            }

            if (command.IsPermanent)
            {
                db.Remove(followUp);

                logger.LogInformation(
                "FollowUp with ID {FollowUpId} deleted successfully",
                command.Request.Id);
            }
            else
            {
                followUp.IsDeleted = true;
                followUp.DeletedAt = DateTime.UtcNow;

                logger.LogInformation(
                "FollowUp with ID {FollowUpId} moved to Trash",
                command.Request.Id);
            }

            await db.SaveChangesAsync(cancellationToken);
            return new DeleteFollowUpResponse(true);
        }
    }
}