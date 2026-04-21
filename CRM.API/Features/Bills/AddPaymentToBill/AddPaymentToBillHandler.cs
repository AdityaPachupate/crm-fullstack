using CRM.API.Common.Interfaces;
using CRM.API.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace CRM.API.Features.Bills.AddPaymentToBill;

public record PaymentRecord(Guid Id, DateTime Date, decimal Amount);

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
            var rawHistory = JsonSerializer.Deserialize<List<JsonElement>>(bill.PaymentHistoryJson ?? "[]", jsonOptions) ?? new();
            history = rawHistory.Select(e => {
                var date = e.TryGetProperty("date", out var dProp) ? dProp.GetDateTime() : bill.CreatedAt;
                var amount = e.TryGetProperty("amount", out var aProp) ? aProp.GetDecimal() : 0;
                var id = e.TryGetProperty("id", out var iProp) ? iProp.GetGuid() : Guid.NewGuid();
                return new PaymentRecord(id, date, amount);
            }).ToList();
        }
        catch 
        {
            history = new();
        }

        // Backfill: If AmountPaid > 0 but history is empty, add the initial payment
        if (bill.AmountPaid > 0 && history.Count == 0)
        {
            history.Add(new PaymentRecord(Guid.NewGuid(), bill.CreatedAt, bill.AmountPaid));
        }

        // Add new payment
        var newPayment = new PaymentRecord(Guid.NewGuid(), DateTime.UtcNow, command.Request.Amount);
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
