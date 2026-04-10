using MediatR;

namespace CRM.API.Features.Leads.DeleteLead
{
    public record DeleteLeadCommand(
        DeleteLeadRequest Request,
        bool IsPermanent = false
        ) : IRequest<DeleteLeadResponse>
    {

    }
}