namespace CRM.API.Features.Enrollments.GetEnrollmentById
{
    public record EnrollmentMedicineItem(
        string MedicineName,
        int Quantity,
        decimal UnitPriceAtSale
    );

    public record GetEnrollmentByIdResponse(
        Guid Id,
        Guid LeadId,
        string LeadName,
        Guid PackageId,
        string PackageName,
        DateOnly StartDate,
        DateOnly EndDate,
        decimal PackageCostSnapshot,
        int PackageDurationSnapshot,
        bool IsDeleted,
        DateTime? DeletedAt,
        DateTime CreatedAt,
        Guid? BillId,
        
        // Financial Summary from linked Bill
        decimal InitialAmount,
        decimal MedicineBillingAmount,
        decimal AmountPaid,
        decimal PendingAmount,

        List<EnrollmentMedicineItem> MedicineItems
    );
}
