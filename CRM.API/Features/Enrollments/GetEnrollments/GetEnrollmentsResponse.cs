namespace CRM.API.Features.Enrollments.GetEnrollments
{
    public record GetEnrollmentsResponse(
        Guid Id,
        string LeadName,
        string LeadPhone,
        string PackageName,
        decimal PackageCostSnapshot,
        DateOnly StartDate,
        DateOnly EndDate,
        DateTime CreatedAt,
        bool IsActive
    );
}
