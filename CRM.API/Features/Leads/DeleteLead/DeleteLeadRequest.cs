using MediatR;

namespace CRM.API.Features.Leads.DeleteLead
{
    public record DeleteLeadRequest(Guid Id);

}