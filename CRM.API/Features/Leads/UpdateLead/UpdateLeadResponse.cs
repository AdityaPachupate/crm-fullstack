using CRM.API.Common.Enums;

namespace CRM.API.Features.Leads.UpdateLead
{
    public record UpdateLeadResponse(
        Guid Id,
        string Name,
        string Phone,
        LeadStatus Status,
        string Source,
        string Reason,
        DateTime CreatedAt,
        DateTime? UpdatedAt
    );
}