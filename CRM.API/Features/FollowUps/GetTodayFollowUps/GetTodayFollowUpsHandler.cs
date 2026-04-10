using CRM.API.Common.Enums;
using CRM.API.Domain;
using CRM.API.Infrastructure.Persistence;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CRM.API.Features.FollowUps.GetTodayFollowUps;

public class GetTodayFollowUpsHandler(AppDbContext db)
    : IRequestHandler<GetTodayFollowUpsQuery, List<GetTodayFollowUpsResponse>>
{
    public async Task<List<GetTodayFollowUpsResponse>> Handle(GetTodayFollowUpsQuery query, CancellationToken cancellationToken)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow.Date);

        // Fetch pending follow-ups for today or earlier
        var followUpsData = await db.FollowUps
            .Include(f => f.Lead)
            .AsNoTracking()
            .Where(f => f.Status == FollowUpStatus.Pending && f.FollowUpDate <= today)
            .ToListAsync(cancellationToken);

        // Project and sort in-memory
        var response = followUpsData
            .Select(f => f.Adapt<GetTodayFollowUpsResponse>() with { IsOverdue = f.FollowUpDate < today })
            .OrderByDescending(f => f.IsOverdue)
            .ThenByDescending(f => f.Priority)
            .ThenBy(f => f.FollowUpDate)
            .ToList();

        return response;
    }
}
