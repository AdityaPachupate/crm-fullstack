using CRM.API.Common.Interfaces;
using CRM.API.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CRM.API.Features.Bills.DeletePaymentFromBill;

public class DeletePaymentFromBillHandler(
    AppDbContext db,
    IBillRepository billRepository,
    ILogger<DeletePaymentFromBillHandler> logger
) : IRequestHandler<DeletePaymentFromBillCommand, DeletePaymentFromBillResponse>
{
    public async Task<DeletePaymentFromBillResponse> Handle(DeletePaymentFromBillCommand command, CancellationToken ct)
    {
        try 
        {
            // 1. Fetch the bill independently
            var bill = await db.Bills.FirstOrDefaultAsync(b => b.Id == command.BillId, ct);
            if (bill == null) return new DeletePaymentFromBillResponse(false, "Bill not found.");

            // 2. Fetch the payment record independently
            var payment = await db.BillPayments
                .IgnoreQueryFilters() // Must include trashed items in case we are doing a hard delete on them
                .FirstOrDefaultAsync(p => p.Id == command.PaymentId && p.BillId == bill.Id, ct);

            if (payment == null) return new DeletePaymentFromBillResponse(false, "Payment record not found.");

            // 3. Apply deletion logic
            if (command.IsHardDelete)
            {
                db.BillPayments.Remove(payment);
            }
            else
            {
                payment.IsDeleted = true;
                payment.DeletedAt = DateTime.UtcNow;
            }

            await db.SaveChangesAsync(ct); // Finish the payment change first

            // 4. Force a total sync from current DB state
            var currentTotalPaid = await db.BillPayments
                .Where(p => p.BillId == bill.Id && !p.IsDeleted)
                .SumAsync(p => p.Amount, ct);

            bill.AmountPaid = currentTotalPaid;
            bill.PendingAmount = (bill.InitialAmount + bill.MedicineBillingAmount) - bill.AmountPaid;

            await db.SaveChangesAsync(ct); // Update the bill summary

            return new DeletePaymentFromBillResponse(true, command.IsHardDelete ? "Permanently deleted." : "Moved to trash.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting payment {PaymentId} for Bill {BillId}: {Message}", command.PaymentId, command.BillId, ex.Message);
            return new DeletePaymentFromBillResponse(false, $"Server Error: {ex.Message}");
        }
    }
}
