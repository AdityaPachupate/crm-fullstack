using CRM.API.Common.Enums;
using MediatR;

namespace CRM.API.Features.FollowUps.CreateFollowUp;

public record CreateFollowUpRequest(
    Guid LeadId,
    DateOnly FollowUpDate,
    string Notes,
    string Source,
    FollowUpPriority Priority
);

public record CreateFollowUpResponse(
    Guid Id,
    Guid LeadId,
    DateOnly FollowUpDate,
    FollowUpStatus Status,
    FollowUpPriority Priority
);

public record CreateFollowUpCommand(CreateFollowUpRequest Request) : IRequest<CreateFollowUpResponse>;
