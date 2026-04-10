using CRM.API.Common.Enums;

namespace CRM.API.Features.FollowUps.CompleteFollowUp;

public record CompleteFollowUpResponse(
    Guid FollowUpId,
    FollowUpStatus Status,
    FollowUpOutcome Outcome,
    Guid? NextFollowUpId = null
);
