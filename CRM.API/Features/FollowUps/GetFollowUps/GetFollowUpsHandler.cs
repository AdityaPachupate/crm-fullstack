using CRM.API.Common.Enums;
using CRM.API.Infrastructure.Persistence;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace CRM.API.Features.FollowUps.GetFollowUps;

public class GetFollowUpsHandler(AppDbContext db)
    : IRequestHandler<GetFollowUpsQuery, List<GetFollowUpsResponse>>
{
    public async Task<List<GetFollowUpsResponse>> Handle(GetFollowUpsQuery query, CancellationToken cancellationToken)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow.Date);

        var dbQuery = db.FollowUps
            .Include(f => f.Lead)
            .AsNoTracking();

        if (query.IsTrash)
        {
            dbQuery = dbQuery.IgnoreQueryFilters().Where(f => f.IsDeleted);
        }

        if (query.Status.HasValue)
        {
            dbQuery = dbQuery.Where(f => f.Status == query.Status.Value);
        }

        if (query.StartDate.HasValue)
        {
            dbQuery = dbQuery.Where(f => f.FollowUpDate >= query.StartDate.Value);
        }

        if (query.EndDate.HasValue)
        {
            dbQuery = dbQuery.Where(f => f.FollowUpDate <= query.EndDate.Value);
        }

        if (query.LeadId.HasValue)
        {
            dbQuery = dbQuery.Where(f => f.LeadId == query.LeadId.Value);
        }

        var followUpsData = await dbQuery.ToListAsync(cancellationToken);

        var response = followUpsData
            .Select(f => f.Adapt<GetFollowUpsResponse>() with 
            { 
                IsOverdue = f.Status == FollowUpStatus.Pending && f.FollowUpDate < today 
            })
            .OrderBy(f => f.FollowUpDate)
            .ThenByDescending(f => f.Priority)
            .ToList();

        return response;
    }
}
