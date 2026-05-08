using MediatR;

namespace CRM.API.Features.Dashboard.GetDashboardStats;

public record GetDashboardStatsQuery : IRequest<GetDashboardStatsResponse>;
