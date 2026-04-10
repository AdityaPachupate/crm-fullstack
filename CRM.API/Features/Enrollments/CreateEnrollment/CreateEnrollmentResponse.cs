namespace CRM.API.Features.Enrollments.CreateEnrollment
{
    public record CreateEnrollmentResponse(
        Guid Id,
        Guid LeadId,
        Guid PackageId,
        DateOnly StartDate,
        DateOnly EndDate,
        decimal PackageCostSnapshot,
        int PackageDurationSnapshot,
        decimal AmountPaid,
        decimal MedicineBillingAmount,
        decimal PendingAmount,
        DateTime CreatedAt
    );
}
