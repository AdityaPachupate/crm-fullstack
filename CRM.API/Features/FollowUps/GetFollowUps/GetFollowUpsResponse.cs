using System;
using CRM.API.Common.Enums;

namespace CRM.API.Features.FollowUps.GetFollowUps;

public record GetFollowUpsResponse(
    Guid Id,
    Guid LeadId,
    string LeadName,
    string LeadPhone,
    DateOnly FollowUpDate,
    FollowUpStatus Status,
    FollowUpPriority Priority,
    string Notes,
    bool IsOverdue,
    DateTime CreatedAt
);
