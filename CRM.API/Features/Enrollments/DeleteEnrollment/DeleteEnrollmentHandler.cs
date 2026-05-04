using CRM.API.Common.Constants;
using CRM.API.Common.ExceptionHandling;
using CRM.API.Common.Interfaces;
using CRM.API.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CRM.API.Features.Enrollments.DeleteEnrollment
{
    public class DeleteEnrollmentHandler(
        AppDbContext db,
        IBillRepository billRepository,
        ILogger<DeleteEnrollmentHandler> logger
    ) : IRequestHandler<DeleteEnrollmentCommand, DeleteEnrollmentResponse>
    {
        public async Task<DeleteEnrollmentResponse> Handle(DeleteEnrollmentCommand command, CancellationToken ct)
        {
            var enrollment = await db.Enrollments
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync(e => e.Id == command.Request.Id, ct);

            if (enrollment == null)
            {
                logger.LogWarning("{Message}: Deleting enrollment {EnrollmentId} not found", LoggingMessages.NotFound, command.Request.Id);
                throw new BusinessException(LoggingMessages.NotFound, $"Enrollment {command.Request.Id} not found", System.Net.HttpStatusCode.NotFound);
            }

            if (command.IsPermanent)
            {
                // Hard Delete
                db.Enrollments.Remove(enrollment);
                logger.LogInformation("Enrollment {EnrollmentId} deleted permanently", command.Request.Id);
            }
            else
            {
                // Soft Delete
                enrollment.IsDeleted = true;
                enrollment.DeletedAt = DateTime.UtcNow;

                // Add a system follow-up to reflect the deletion in the timeline
                var systemFollowUp = new CRM.API.Domain.FollowUp
                {
                    Id = Guid.NewGuid(),
                    LeadId = enrollment.LeadId,
                    FollowUpDate = DateOnly.FromDateTime(DateTime.UtcNow),
                    Notes = $"Enrollment was deleted/cancelled.",
                    Source = "System",
                    Priority = CRM.API.Common.Enums.FollowUpPriority.Low,
                    Status = CRM.API.Common.Enums.FollowUpStatus.Completed,
                    CreatedAt = DateTime.UtcNow,
                    CompletedAt = DateTime.UtcNow
                };
                db.FollowUps.Add(systemFollowUp);

                // Detach the bill so it remains active for the lead but unlinked from the deleted enrollment.
                await billRepository.DetachBillFromEnrollmentAsync(enrollment.Id, ct);

                logger.LogInformation("Enrollment {EnrollmentId} trashed. Bill detached but preserved.", command.Request.Id);
            }

            await db.SaveChangesAsync(ct);
            return new DeleteEnrollmentResponse(true);
        }
    }
}
