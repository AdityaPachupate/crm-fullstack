using System.Collections.Generic;

namespace CRM.API.Features.Dashboard.GetDashboardStats;

public record DashboardStatDistribution(string Name, int Value);

public record PriorityTask(
    Guid Id,
    string LeadName,
    DateOnly FollowUpDate,
    string Notes,
    string Priority,
    bool IsOverdue
);

public record GetDashboardStatsResponse(
    int TotalPatients,
    string PatientsTrend,
    int ActiveEnrollments,
    string EnrollmentsTrend,
    int TodayTasks,
    int OverdueTasks,
    string TasksTrend,
    decimal PendingBilling,
    string BillingTrend,
    List<DashboardStatDistribution> StatusDistribution,
    List<DashboardStatDistribution> SourceDistribution,
    List<PriorityTask> PriorityTasks
);
