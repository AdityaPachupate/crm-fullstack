using MediatR;

namespace CRM.API.Features.FollowUps.RestoreFollowUp
{
    public record RestoreFollowUpCommand(RestoreFollowUpRequest Request)
     : IRequest<RestoreFollowUpResponse>;
}