using Microsoft.EntityFrameworkCore;

namespace CRM.API.Infrastructure.Persistence.Jobs
{
    public class TrashCleanupJob(
        IServiceScopeFactory scopeFactory,
        ILogger<TrashCleanupJob> logger
    ) : BackgroundService
    {
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                logger.LogInformation("Trash Cleanup Job starting...");
                try
                {
                    using var scope = scopeFactory.CreateScope();
                    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                    var cutoffDate = DateTime.UtcNow.AddDays(-30);

                    var leadsToDelete = await db.Leads
                        .IgnoreQueryFilters()
                        .Where(l => l.IsDeleted && l.DeletedAt <= cutoffDate)
                        .ToListAsync(stoppingToken);
                    if (leadsToDelete.Any())
                    {
                        db.Leads.RemoveRange(leadsToDelete);
                        await db.SaveChangesAsync(stoppingToken);
                        logger.LogInformation("Permanently deleted {Count} old leads from trash.", leadsToDelete.Count);
                    }
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error occurred while cleaning up the trash.");
                }

                await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
            }
        }
    }
}