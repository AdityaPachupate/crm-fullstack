using CRM.API.Common.Interfaces;
using CRM.API.Domain;
using CRM.API.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace CRM.API.Features.Bills.AddPaymentToBill;

public record PaymentRecord(Guid Id, DateTime Date, decimal Amount);

public class AddPaymentToBillHandler(
    AppDbContext db,
    ILogger<AddPaymentToBillHandler> logger
) : IRequestHandler<AddPaymentToBillCommand, AddPaymentToBillResponse>
{
    public async Task<AddPaymentToBillResponse> Handle(AddPaymentToBillCommand command, CancellationToken ct)
    {
        try 
        {
            // 1. Fetch the bill without complex includes to avoid tracking bloat
            var bill = await db.Bills
                .FirstOrDefaultAsync(b => b.Id == command.Id, ct);

            if (bill == null)
            {
                logger.LogWarning("Bill {BillId} not found for payment recording.", command.Id);
                return new AddPaymentToBillResponse(false, "Bill not found.");
            }

            // 2. Create and add the new payment record first
            var payment = new BillPayment
            {
                Id = Guid.NewGuid(),
                BillId = bill.Id,
                Amount = command.Request.Amount,
                DatePaid = DateTime.UtcNow,
                IsDeleted = false
            };

            db.BillPayments.Add(payment);
            await db.SaveChangesAsync(ct); // Save the payment first

            // 3. Force a totals recalculation from the DB state
            // This is the most reliable way to ensure AmountPaid matches the truth
            var allActivePaymentsSum = await db.BillPayments
                .Where(p => p.BillId == bill.Id && !p.IsDeleted)
                .SumAsync(p => p.Amount, ct);

            bill.AmountPaid = allActivePaymentsSum;
            bill.PendingAmount = (bill.InitialAmount + bill.MedicineBillingAmount) - bill.AmountPaid;

            await db.SaveChangesAsync(ct); // Update the summary on the Bill

            logger.LogInformation("Payment recorded and totals synced. BillId: {BillId}. TransactionId: {PaymentId}", 
                bill.Id, payment.Id);

            return new AddPaymentToBillResponse(true, "Payment recorded successfully.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Detailed error while recording payment for Bill {BillId}: {Message}", command.Id, ex.Message);
            return new AddPaymentToBillResponse(false, $"Server Error: {ex.Message}");
        }
    }
}
