using CRM.API.Common.Enums;

namespace CRM.API.Features.Leads.UpdateLead
{
    public record UpdateLeadRequest(Guid Id,
         string? Name,
         string? Phone,
         LeadStatus? Status,
         string? Source,
         string? Reason);
}