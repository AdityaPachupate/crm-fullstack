using MediatR;

namespace CRM.API.Features.Leads.RestoreLead;

public record RestoreLeadCommand(RestoreLeadRequest Request) : IRequest<RestoreLeadResponse>;
