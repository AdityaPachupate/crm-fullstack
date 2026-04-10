using CRM.API.Common.Enums;

namespace CRM.API.Features.Leads.CreateLead
{
    public record CreateLeadResponse(
        Guid Id,
        string Name,
        string Phone,
        LeadStatus Status,
        string Source,
        string Reason,
        DateTime CreatedAt
    );
}
