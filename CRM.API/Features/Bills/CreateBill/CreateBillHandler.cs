using CRM.API.Common.Constants;
using CRM.API.Common.ExceptionHandling;
using CRM.API.Common.Interfaces;
using CRM.API.Domain;
using CRM.API.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Net;

namespace CRM.API.Features.Bills.CreateBill
{
    public class CreateBillHandler(AppDbContext db, IBillRepository billRepository, ILogger<CreateBillHandler> logger) 
        : IRequestHandler<CreateBillCommand, CreateBillResponse>
    {
        public async Task<CreateBillResponse> Handle(CreateBillCommand command, CancellationToken ct)
        {
            var req = command.Request;

            // 1. Validate Lead (keeping this here for fast termination)
            var leadExists = await db.Leads.AnyAsync(l => l.Id == req.LeadId, ct);
            if (!leadExists)
            {
                logger.LogWarning("{Message}: Creating Bill failed - Lead {LeadId} not found", LoggingMessages.NotFound, req.LeadId);
                throw new BusinessException(LoggingMessages.NotFound, $"Lead {req.LeadId} not found", HttpStatusCode.NotFound);
            }

            // 2. Map medicine items for the repository
            var medicineItems = req.MedicineItems?.Select(i => (i.MedicineId, i.Quantity)) 
                                ?? Enumerable.Empty<(Guid, int)>();

            // 3. Create Bill via Repository
            var bill = new Bill
            {
                LeadId = req.LeadId,
                EnrollmentId = req.EnrollmentId,
                RejoinRecordId = req.RejoinRecordId,
                InitialAmount = req.PackageAmount,
                AmountPaid = req.AmountPaid,
                CreatedAt = DateTime.UtcNow
            };

            await billRepository.CreateBillWithItemsAsync(bill, medicineItems, ct);
            logger.LogInformation("{Message}: Bill {BillId} created for Lead {LeadId}", LoggingMessages.ResourceCreated, bill.Id, req.LeadId);

            return new CreateBillResponse(
                bill.Id,
                bill.InitialAmount,
                bill.AmountPaid,
                bill.PendingAmount,
                bill.MedicineBillingAmount,
                bill.CreatedAt
            );
        }
    }
}
