namespace CRM.API.Features.Enrollments.UpdateEnrollment
{
    public record UpdateEnrollmentRequest(
        Guid Id,
        Guid? LeadId = null,
        Guid? PackageId = null,
        DateOnly? StartDate = null,
        DateOnly? EndDate = null,
        decimal? PackageCostSnapshot = null,
        int? PackageDurationSnapshot = null
    );
}
