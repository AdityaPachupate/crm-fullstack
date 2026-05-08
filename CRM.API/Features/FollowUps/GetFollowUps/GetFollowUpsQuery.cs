using System;
using CRM.API.Common.Enums;
using MediatR;
using System.Collections.Generic;

namespace CRM.API.Features.FollowUps.GetFollowUps;

public record GetFollowUpsQuery(
    FollowUpStatus? Status = null,
    DateOnly? StartDate = null,
    DateOnly? EndDate = null,
    Guid? LeadId = null,
    bool IsTrash = false
) : IRequest<List<GetFollowUpsResponse>>;
