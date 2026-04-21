using MediatR;

namespace CRM.API.Features.Bills.GetLeadBills
{
    public record BillItemResponse(Guid MedicineId, string MedicineName, int Quantity, decimal UnitPriceAtSale);
    public record BillPaymentResponse(Guid Id, decimal Amount, DateTime DatePaid, bool IsDeleted);
    
    public record GetLeadBillsResponse(
        Guid Id,
        decimal InitialAmount,
        decimal AmountPaid,
        decimal PendingAmount,
        decimal MedicineBillingAmount,
        DateTime CreatedAt,
        string PackageName,
        List<BillItemResponse> Items,
        List<BillPaymentResponse> Payments
    );

    public record GetLeadBillsQuery(Guid LeadId) : IRequest<List<GetLeadBillsResponse>>;
}
