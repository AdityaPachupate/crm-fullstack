namespace CRM.API.Features.Bills.GetAllBills;

public record GetAllBillsResponse(
    Guid Id,
    Guid LeadId,
    string LeadName,
    decimal InitialAmount,
    decimal MedicineBillingAmount,
    decimal AmountPaid,
    decimal PendingAmount,
    DateTime CreatedAt,
    bool IsDeleted
);