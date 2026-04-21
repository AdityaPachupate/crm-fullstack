using CRM.API.Common.Enums;

namespace CRM.API.Features.Leads.GetLeadsById
{
    public record GetLeadsByIdResponse(
        Guid Id,
        string Name,
        string Phone,
        LeadStatus Status,
        string Source,
        string Reason,
        DateTime CreatedAt,
        DateTime? UpdatedAt,
        List<FollowUpDto> FollowUps,
        List<EnrollmentDto> Enrollments,
        List<RejoinRecordDto> RejoinRecords
    );

    public record FollowUpDto(
        Guid Id,
        DateOnly FollowUpDate,
        string Notes,
        string Source,
        FollowUpPriority Priority,
        FollowUpStatus Status,
        DateTime CreatedAt,
        DateTime? CompletedAt
    );

    public record EnrollmentDto(
        Guid Id,
        Guid PackageId,
        string PackageName,
        decimal PackageCostSnapshot,
        int PackageDurationSnapshot,
        DateOnly StartDate,
        DateOnly EndDate,
        DateTime CreatedAt,
        BillDto? Bill
    );

    public record RejoinRecordDto(
        Guid Id,
        Guid PackageId,
        string PackageName,
        decimal PackageCostSnapshot,
        int PackageDurationSnapshot,
        DateOnly StartDate,
        DateOnly EndDate,
        DateTime CreatedAt,
        BillDto? Bill
    );

    public record BillDto(
        Guid Id,
        decimal PackageAmount,
        decimal AdvanceAmount,
        decimal PendingAmount,
        decimal MedicineBillingAmount,
        DateTime CreatedAt,
        string? PaymentHistoryJson
    );
}