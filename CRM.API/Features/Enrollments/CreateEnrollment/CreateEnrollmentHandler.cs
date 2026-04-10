using CRM.API.Common.Constants;
using CRM.API.Common.Enums;
using CRM.API.Common.ExceptionHandling;
using CRM.API.Common.Interfaces;
using CRM.API.Domain;
using CRM.API.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace CRM.API.Features.Enrollments.CreateEnrollment
{
    public class CreateEnrollmentHandler(AppDbContext db, IBillRepository billRepository, ILogger<CreateEnrollmentHandler> logger) 
        : IRequestHandler<CreateEnrollmentCommand, CreateEnrollmentResponse>
    {
        public async Task<CreateEnrollmentResponse> Handle(CreateEnrollmentCommand command, CancellationToken ct)
        {
            var req = command.Request;

            // 1. Fetch Related Entities
            var lead = await db.Leads.FindAsync([req.LeadId], ct);
            if (lead == null)
            {
                logger.LogWarning("{Message}: Create Enrollment failed - Lead {LeadId} not found", LoggingMessages.NotFound, req.LeadId);
                throw new BusinessException(LoggingMessages.NotFound, $"Lead {req.LeadId} not found", HttpStatusCode.NotFound);
            }
            
            var package = await db.Packages.FindAsync([req.PackageId], ct);
            if (package == null)
            {
                logger.LogWarning("{Message}: Create Enrollment failed - Package {PackageId} not found", LoggingMessages.NotFound, req.PackageId);
                throw new BusinessException(LoggingMessages.NotFound, $"Package {req.PackageId} not found", HttpStatusCode.NotFound);
            }

            // 2. Create Enrollment
            var enrollment = new Enrollment
            {
                Id = Guid.NewGuid(),
                LeadId = lead.Id,
                PackageId = package.Id,
                StartDate = req.StartDate,
                EndDate = req.StartDate.AddDays(package.DurationInDays),
                PackageCostSnapshot = package.Cost,
                PackageDurationSnapshot = package.DurationInDays,
                CreatedAt = DateTime.UtcNow
            };

            // 3. Update Lead Status
            lead.Status = LeadStatus.Converted;

            // 5. Save Enrollment and Bill atomically via Graph Tracking
            await db.Enrollments.AddAsync(enrollment, ct);

            // 4. Create Initial Bill via Repository (Shared Logic)
            var bill = new Bill
            {
                Id = Guid.NewGuid(),
                LeadId = lead.Id,
                EnrollmentId = enrollment.Id,
                InitialAmount = package.Cost,
                AmountPaid = req.AmountPaid,
                CreatedAt = DateTime.UtcNow
            };

            var medicineItems = req.MedicineItems?.Select(i => (i.MedicineId, i.Quantity)) 
                                ?? Enumerable.Empty<(Guid, int)>();

            enrollment.Bill = bill;
            await billRepository.CreateBillWithItemsAsync(bill, medicineItems, ct);

            logger.LogInformation("{Message}: Enrollment {EnrollmentId} created with synchronized Bill via IBillRepository", 
                LoggingMessages.ResourceCreated, enrollment.Id);

            return new CreateEnrollmentResponse(
                enrollment.Id,
                enrollment.LeadId,
                enrollment.PackageId,
                enrollment.StartDate,
                enrollment.EndDate,
                enrollment.PackageCostSnapshot,
                enrollment.PackageDurationSnapshot,
                bill.AmountPaid,
                bill.MedicineBillingAmount,
                bill.PendingAmount,
                enrollment.CreatedAt
            );
        }
    }
}