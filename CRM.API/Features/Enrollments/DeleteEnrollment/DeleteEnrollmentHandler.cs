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
                await billRepository.DeleteBillByEnrollmentAsync(enrollment.Id, true, ct);
                db.Enrollments.Remove(enrollment);
                logger.LogInformation("Enrollment {EnrollmentId} and associated bill deleted permanently", command.Request.Id);
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

                // Soft-delete the associated bill so it no longer appears in the active balance.
                await billRepository.DeleteBillByEnrollmentAsync(enrollment.Id, false, ct);

                logger.LogInformation("Enrollment {EnrollmentId} trashed. Associated bill moved to Trash.", command.Request.Id);
            }

            await db.SaveChangesAsync(ct);
            return new DeleteEnrollmentResponse(true);
        }
    }
}
