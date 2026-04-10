using System;

namespace CRM.API.Features.Enrollments.UpdateEnrollment
{
    public record UpdateEnrollmentResponse(
        Guid Id,
        Guid LeadId,
        Guid PackageId,
        DateOnly StartDate,
        DateOnly EndDate,
        decimal PackageCostSnapshot,
        int PackageDurationSnapshot,
        DateTime CreatedAt
    );
}