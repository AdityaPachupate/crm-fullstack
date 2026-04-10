using CRM.API.Common.Enums;

namespace CRM.API.Features.FollowUps.CompleteFollowUp;

public record CompleteFollowUpRequest(
    Guid FollowUpId,
    FollowUpOutcome Outcome,
    string Notes,
    LeadStatus? NewLeadStatus = null,
    DateOnly? NextFollowUpDate = null,
    FollowUpPriority? NextFollowUpPriority = null
);
