namespace CRM.API.Features.Bills.UpdateBill;

public record BillItemDto(Guid MedicineId, int Quantity);

public record UpdateBillRequest(
    decimal? InitialAmount = null,
    decimal? AmountPaid = null,
    List<BillItemDto>? Items = null
);
