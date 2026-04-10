using MediatR;

namespace CRM.API.Features.Leads.CreateLead
{
    public record CreateLeadCommand(CreateLeadRequest Request) : IRequest<CreateLeadResponse>;
}