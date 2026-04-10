using CRM.API.Features.Bills.CreateBill;

namespace CRM.API.Features.Enrollments.CreateEnrollment
{
    public record CreateEnrollmentRequest(
        Guid LeadId,
        Guid PackageId,
        DateOnly StartDate,
        decimal AmountPaid,
        List<MedicineItemRequest>? MedicineItems = null
    );
}