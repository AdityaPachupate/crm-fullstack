using CRM.API.Common.Enums;

namespace CRM.API.Features.Leads.CreateLead
{
    public record CreateLeadRequest(
        string Name, string Phone, LeadStatus Status, string Source, string Reason);
}
