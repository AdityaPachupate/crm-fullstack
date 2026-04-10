using MediatR;

namespace CRM.API.Features.Bills.CreateBill
{
    public record MedicineItemRequest(Guid MedicineId, int Quantity);

    public record CreateBillRequest(
        Guid LeadId,
        Guid? EnrollmentId,
        Guid? RejoinRecordId,
        decimal PackageAmount,
        decimal AmountPaid,
        List<MedicineItemRequest> MedicineItems
    );

    public record CreateBillResponse(
        Guid Id,
        decimal InitialAmount,
        decimal AmountPaid,
        decimal PendingAmount,
        decimal MedicineBillingAmount,
        DateTime CreatedAt
    );

    public record CreateBillCommand(CreateBillRequest Request) : IRequest<CreateBillResponse>;
}
