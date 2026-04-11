namespace CRM.API.Features.Leads.GetLeads
{
    using CRM.API.Common.Enums;
    using System;

    public record GetLeadsResponse(
        Guid Id,
        string Name,
        string Phone,
        LeadStatus Status,
        string? Source,
        string? Reason,
        DateTime CreatedAt,
        DateTime? UpdatedAt,
        bool HasEnrollment,
        bool HasMedicine
    );
}
