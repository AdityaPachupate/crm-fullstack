using CRM.API.Common.Interfaces;
using CRM.API.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace CRM.API.Features.Bills.AddPaymentToBill;

public record PaymentRecord(DateTime Date, decimal Amount);

public class AddPaymentToBillHandler(
    AppDbContext db,
    IBillRepository billRepository,
    ILogger<AddPaymentToBillHandler> logger
) : IRequestHandler<AddPaymentToBillCommand, AddPaymentToBillResponse>
{
    public async Task<AddPaymentToBillResponse> Handle(AddPaymentToBillCommand command, CancellationToken ct)
    {
        var bill = await db.Bills
            .IgnoreQueryFilters()
            .Include(b => b.Items)
            .FirstOrDefaultAsync(b => b.Id == command.Id, ct);

        if (bill == null)
        {
            logger.LogWarning("Bill {BillId} not found for payment recording.", command.Id);
            return new AddPaymentToBillResponse(false, "Bill not found.");
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

        // Backfill: If AmountPaid > 0 but history is empty, add the initial payment
        if (bill.AmountPaid > 0 && history.Count == 0)
        {
            history.Add(new PaymentRecord(bill.CreatedAt, bill.AmountPaid));
        }

        // Add new payment
        var newPayment = new PaymentRecord(DateTime.UtcNow, command.Request.Amount);
        history.Add(newPayment);

        // Update totals
        bill.AmountPaid += command.Request.Amount;
        billRepository.RecalculateTotals(bill);

        // Serialize back
        bill.PaymentHistoryJson = JsonSerializer.Serialize(history, jsonOptions);

        await db.SaveChangesAsync(ct);

        logger.LogInformation("Payment recorded. Total Paid: {Paid}, History Count: {Count}", 
            bill.AmountPaid, history.Count);

        return new AddPaymentToBillResponse(true, "Payment recorded successfully.");
    }
}
