using CRM.API.Common.Enums;
using CRM.API.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CRM.API.Features.Dashboard.GetDashboardStats;

public class GetDashboardStatsHandler(AppDbContext db) : IRequestHandler<GetDashboardStatsQuery, GetDashboardStatsResponse>
{
    public async Task<GetDashboardStatsResponse> Handle(GetDashboardStatsQuery request, CancellationToken cancellationToken)
    {
        var today = DateOnly.FromDateTime(DateTime.Today);
        var now = DateTime.UtcNow;
        var firstDayOfCurrentMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var firstDayOfLastMonth = firstDayOfCurrentMonth.AddMonths(-1);

        // 1. Total Patients & Trend
        var totalPatients = await db.Leads.CountAsync(cancellationToken);
        var patientsThisMonth = await db.Leads
            .Where(l => l.CreatedAt >= firstDayOfCurrentMonth)
            .CountAsync(cancellationToken);
        var patientsLastMonth = await db.Leads
            .Where(l => l.CreatedAt >= firstDayOfLastMonth && l.CreatedAt < firstDayOfCurrentMonth)
            .CountAsync(cancellationToken);

        string patientsTrend = "+0% month";
        if (patientsLastMonth > 0)
        {
            var change = ((double)(patientsThisMonth - patientsLastMonth) / patientsLastMonth) * 100;
            patientsTrend = $"{(change >= 0 ? "+" : "")}{change:F0}% month";
        }
        else if (patientsThisMonth > 0)
        {
            patientsTrend = $"+{patientsThisMonth} new";
        }

        // 2. Active Enrollments
        var activeEnrollments = await db.Enrollments
            .Where(e => !e.IsDeleted && e.StartDate <= today && e.EndDate >= today)
            .CountAsync(cancellationToken);
        
        string enrollmentsTrend = $"{activeEnrollments} active";

        // 3. Today's Tasks & Overdue
        var todayTasks = await db.FollowUps
            .CountAsync(f => !f.IsDeleted && f.Status == FollowUpStatus.Pending && f.FollowUpDate == today, cancellationToken);
        
        var overdueTasks = await db.FollowUps
            .CountAsync(f => !f.IsDeleted && f.Status == FollowUpStatus.Pending && f.FollowUpDate < today, cancellationToken);
        
        string tasksTrend = $"{overdueTasks} overdue";

        // 4. Pending Billing
        var pendingBilling = await db.Bills
            .Where(b => !b.IsDeleted)
            .SumAsync(b => b.PendingAmount, cancellationToken);
        
        string billingTrend = "Action req.";

        // 5. Status Distribution (Fetch raw first to avoid translation issues)
        var statusData = await db.Leads
            .GroupBy(l => l.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);

        var statusDistribution = statusData
            .Select(x => new DashboardStatDistribution(x.Status.ToString(), x.Count))
            .ToList();

        // 6. Source Distribution
        var sourceData = await db.Leads
            .GroupBy(l => l.Source)
            .Select(g => new { Source = g.Key, Count = g.Count() })
            .OrderByDescending(d => d.Count)
            .Take(5)
            .ToListAsync(cancellationToken);

        var sourceDistribution = sourceData
            .Select(x => new DashboardStatDistribution(string.IsNullOrEmpty(x.Source) ? "Unknown" : x.Source, x.Count))
            .ToList();

        // 7. Priority Tasks
        var tasksData = await db.FollowUps
            .Include(f => f.Lead)
            .Where(f => !f.IsDeleted && f.Status == FollowUpStatus.Pending && (f.FollowUpDate <= today))
            .OrderByDescending(f => f.Priority)
            .ThenBy(f => f.FollowUpDate)
            .Take(5)
            .ToListAsync(cancellationToken);

        var priorityTasks = tasksData
            .Select(f => new PriorityTask(
                f.Id,
                f.Lead.Name,
                f.FollowUpDate,
                f.Notes,
                f.Priority.ToString(),
                f.FollowUpDate < today
            ))
            .ToList();

        return new GetDashboardStatsResponse(
            totalPatients,
            patientsTrend,
            activeEnrollments,
            enrollmentsTrend,
            todayTasks,
            overdueTasks,
            tasksTrend,
            pendingBilling,
            billingTrend,
            statusDistribution,
            sourceDistribution,
            priorityTasks
        );
    }
}
