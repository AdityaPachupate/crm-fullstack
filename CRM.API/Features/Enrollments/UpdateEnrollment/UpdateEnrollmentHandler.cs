using CRM.API.Common.Constants;
using CRM.API.Common.ExceptionHandling;
using CRM.API.Common.Interfaces;
using CRM.API.Domain;
using CRM.API.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace CRM.API.Features.Enrollments.UpdateEnrollment
{
    public class UpdateEnrollmentHandler(
        AppDbContext db,
        IBillRepository billRepository,
        ILogger<UpdateEnrollmentHandler> logger
    ) : IRequestHandler<UpdateEnrollmentCommand, UpdateEnrollmentResponse>
    {
        public async Task<UpdateEnrollmentResponse> Handle(UpdateEnrollmentCommand command, CancellationToken ct)
        {
            var request = command.Request;

            var enrollment = await db.Enrollments
                    .Include(e => e.Package)
                    .Include(e => e.Bill!)
                        .ThenInclude(b => b.Items)
                    .FirstOrDefaultAsync(e => e.Id == request.Id, ct);

            if (enrollment == null)
            {
                logger.LogWarning("{Message}: Updating enrollment {EnrollmentId} not found", LoggingMessages.NotFound, request.Id);
                throw new BusinessException(LoggingMessages.NotFound, $"Enrollment {request.Id} not found", HttpStatusCode.NotFound);
            }

            if (request.LeadId.HasValue && request.LeadId != enrollment.LeadId)
            {
                enrollment.LeadId = request.LeadId.Value;
                if (enrollment.Bill != null) enrollment.Bill.LeadId = request.LeadId.Value;
            }

            bool packageChanged = false;
            if (request.PackageId.HasValue && request.PackageId != enrollment.PackageId)
            {
                var newPackage = await db.Packages.FirstOrDefaultAsync(p => p.Id == request.PackageId.Value, ct);
                if (newPackage == null)
                {
                    logger.LogWarning("{Message}: Package {PackageId} not found for Enrollment update", LoggingMessages.NotFound, request.PackageId.Value);
                    throw new BusinessException(LoggingMessages.NotFound, $"Package {request.PackageId.Value} not found", HttpStatusCode.NotFound);
                }

                enrollment.PackageId = newPackage.Id;
                enrollment.PackageCostSnapshot = newPackage.Cost;
                enrollment.PackageDurationSnapshot = newPackage.DurationInDays;
                packageChanged = true;
            }

            enrollment.PackageCostSnapshot = request.PackageCostSnapshot ?? enrollment.PackageCostSnapshot;
            enrollment.PackageDurationSnapshot = request.PackageDurationSnapshot ?? enrollment.PackageDurationSnapshot;

            if (enrollment.Bill != null)
            {
                enrollment.Bill.InitialAmount = enrollment.PackageCostSnapshot;
                billRepository.RecalculateTotals(enrollment.Bill);
            }

            // Dates
            bool startDateChanged = request.StartDate.HasValue && request.StartDate != enrollment.StartDate;
            enrollment.StartDate = request.StartDate ?? enrollment.StartDate;

            if (request.EndDate.HasValue)
            {
                enrollment.EndDate = request.EndDate.Value;
            }
            else if (packageChanged || startDateChanged)
            {
                enrollment.EndDate = enrollment.StartDate.AddDays(enrollment.PackageDurationSnapshot);
            }

            await db.SaveChangesAsync(ct);
            logger.LogInformation("{Message}: Enrollment {EnrollmentId} and its Bill synchronized.", LoggingMessages.ResourceUpdated, enrollment.Id);

            return new UpdateEnrollmentResponse(
                enrollment.Id,
                enrollment.LeadId,
                enrollment.PackageId,
                enrollment.StartDate,
                enrollment.EndDate,
                enrollment.PackageCostSnapshot,
                enrollment.PackageDurationSnapshot,
                enrollment.CreatedAt
            );
        }
    }
}