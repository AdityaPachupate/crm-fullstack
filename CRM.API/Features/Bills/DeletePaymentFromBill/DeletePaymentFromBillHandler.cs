using CRM.API.Common.Interfaces;
using CRM.API.Infrastructure.Persistence;
using CRM.API.Features.Bills.AddPaymentToBill; // To reuse PaymentRecord
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace CRM.API.Features.Bills.DeletePaymentFromBill;

public class DeletePaymentFromBillHandler(
    AppDbContext db,
    IBillRepository billRepository,
    ILogger<DeletePaymentFromBillHandler> logger
) : IRequestHandler<DeletePaymentFromBillCommand, DeletePaymentFromBillResponse>
{
    public async Task<DeletePaymentFromBillResponse> Handle(DeletePaymentFromBillCommand command, CancellationToken ct)
    {
        var bill = await db.Bills
            .IgnoreQueryFilters()
            .Include(b => b.Items)
            .FirstOrDefaultAsync(b => b.Id == command.BillId, ct);

        if (bill == null)
        {
            return new DeletePaymentFromBillResponse(false, "Bill not found.");
        }

        // Deserialize existing history
        List<PaymentRecord> history;
        var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        try 
        {
            history = JsonSerializer.Deserialize<List<PaymentRecord>>(bill.PaymentHistoryJson ?? "[]", jsonOptions) ?? new();
        }
        catch 
        {
            history = new();
        }

        // Find the payment to delete
        var paymentToDelete = history.FirstOrDefault(p => p.Id == command.PaymentId);
        if (paymentToDelete == null)
        {
            return new DeletePaymentFromBillResponse(false, "Transaction not found in history.");
        }

        // Subtract amount and remove from history
        bill.AmountPaid -= paymentToDelete.Amount;
        history.Remove(paymentToDelete);

        // Recalculate totals (PendingAmount)
        billRepository.RecalculateTotals(bill);

        // Serialize back
        bill.PaymentHistoryJson = JsonSerializer.Serialize(history, jsonOptions);

        await db.SaveChangesAsync(ct);

        logger.LogInformation("Payment transaction {PaymentId} deleted from Bill {BillId}. New Total Paid: {Paid}", 
            command.PaymentId, command.BillId, bill.AmountPaid);

        return new DeletePaymentFromBillResponse(true, "Transaction deleted successfully.");
    }
}
