using MediatR;

namespace CRM.API.Features.Bills.GetLeadBills
{
    public record BillItemResponse(Guid MedicineId, string MedicineName, int Quantity, decimal UnitPriceAtSale);
    
    public record GetLeadBillsResponse(
        Guid Id,
        decimal InitialAmount,
        decimal AmountPaid,
        decimal PendingAmount,
        decimal MedicineBillingAmount,
        DateTime CreatedAt,
        List<BillItemResponse> Items
    );

    public record GetLeadBillsQuery(Guid LeadId) : IRequest<List<GetLeadBillsResponse>>;
}
