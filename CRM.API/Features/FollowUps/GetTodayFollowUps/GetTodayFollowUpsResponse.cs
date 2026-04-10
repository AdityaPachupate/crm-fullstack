using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CRM.API.Common.Enums;

namespace CRM.API.Features.FollowUps.GetTodayFollowUps
{
    public record GetTodayFollowUpsResponse(
    Guid Id,
    Guid LeadId,
    string LeadName,
    string LeadPhone,
    DateOnly FollowUpDate,
    FollowUpStatus Status,
    FollowUpPriority Priority,
    string Notes,
    bool IsOverdue
);
}