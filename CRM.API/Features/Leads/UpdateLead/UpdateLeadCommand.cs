using MediatR;
using CRM.API.Common.Enums;

namespace CRM.API.Features.Leads.UpdateLead
{
    public record UpdateLeadCommand(UpdateLeadRequest UpdateLeadRequest) : IRequest<UpdateLeadResponse>;
}