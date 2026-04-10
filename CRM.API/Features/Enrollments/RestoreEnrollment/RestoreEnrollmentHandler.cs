using CRM.API.Common.Constants;
using CRM.API.Common.ExceptionHandling;
using CRM.API.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CRM.API.Features.Enrollments.RestoreEnrollment
{
    public class RestoreEnrollmentHandler(
        AppDbContext db,
        ILogger<RestoreEnrollmentHandler> logger
    ) : IRequestHandler<RestoreEnrollmentCommand, RestoreEnrollmentResponse>
    {
        public async Task<RestoreEnrollmentResponse> Handle(RestoreEnrollmentCommand command, CancellationToken cancellationToken)
        {
            var enrollment = await db.Enrollments
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync(e => e.Id == command.Request.Id, cancellationToken);

            if (enrollment == null)
            {
                logger.LogWarning("{Message}: Restoring enrollment with ID {EnrollmentId} not found", LoggingMessages.NotFound, command.Request.Id);
                throw new BusinessException(
                   LoggingMessages.NotFound,
                   $"Restoring enrollment with ID {command.Request.Id}",
                   System.Net.HttpStatusCode.NotFound
               );
            }

            // Restore from Trash
            enrollment.IsDeleted = false;
            enrollment.DeletedAt = null;

            logger.LogInformation("Enrollment with ID {EnrollmentId} restored successfully", command.Request.Id);

            await db.SaveChangesAsync(cancellationToken);
            return new RestoreEnrollmentResponse(true);
        }
    }
}
