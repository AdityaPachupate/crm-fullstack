using CRM.API.Common.Enums;
using MediatR;

namespace CRM.API.Features.FollowUps.CompleteFollowUp;

public record CompleteFollowUpCommand(CompleteFollowUpRequest Request) : IRequest<CompleteFollowUpResponse>;
