using CRM.API.Common.Interfaces;
using CRM.API.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Text;

namespace CRM.API.Infrastructure.Persistence.Jobs
{
    public class FollowUpReminderJob(
        IServiceScopeFactory scopeFactory,
        ILogger<FollowUpReminderJob> logger,
        IConfiguration configuration
    ) : BackgroundService
    {
        private readonly string[] _targetNumbers = (configuration["WHATSAPP_NUMBERS"] ?? "")
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            if (_targetNumbers.Length == 0)
            {
                logger.LogWarning("No target numbers defined in WHATSAPP_NUMBERS. Reminder job will not send messages.");
            }

            while (!stoppingToken.IsCancellationRequested)
            {
                var now = DateTime.Now;
                
                // Calculate next run
                var next9AM = now.Date.AddHours(9);
                if (now > next9AM) next9AM = next9AM.AddDays(1);

                var next10PM = now.Date.AddHours(22);
                if (now > next10PM) next10PM = next10PM.AddDays(1);

                var nextRun = next9AM < next10PM ? next9AM : next10PM;
                var delay = nextRun - now;

                logger.LogInformation("Next reminder job scheduled for {Time} (in {Delay})", nextRun, delay);
                
                try 
                {
                    await Task.Delay(delay, stoppingToken);
                }
                catch (TaskCanceledException) { break; }

                // Determine which report to send
                var isMorning = DateTime.Now.Hour >= 8 && DateTime.Now.Hour <= 10;
                
                try
                {
                    await SendRemindersAsync(isMorning, stoppingToken);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Error occurred while sending scheduled reminders.");
                }
            }
        }

        private async Task SendRemindersAsync(bool isMorning, CancellationToken ct)
        {
            using var scope = scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var notifier = scope.ServiceProvider.GetRequiredService<INotificationService>();

            var today = DateOnly.FromDateTime(DateTime.Today);
            var yesterday = today.AddDays(-1);
            var tomorrow = today.AddDays(1);

            string message;

            if (isMorning)
            {
                // 9 AM: Today's followups + Yesterday's pending
                var todayFollowUps = await db.FollowUps
                    .Include(f => f.Lead)
                    .Where(f => !f.IsDeleted && f.CompletedAt == null && f.FollowUpDate == today)
                    .ToListAsync(ct);

                var yesterdayPending = await db.FollowUps
                    .Include(f => f.Lead)
                    .Where(f => !f.IsDeleted && f.CompletedAt == null && f.FollowUpDate <= yesterday)
                    .ToListAsync(ct);

                if (todayFollowUps.Count == 0 && yesterdayPending.Count == 0) return;

                var sb = new StringBuilder();
                sb.AppendLine("☀️ *Morning Follow-up Summary*");
                sb.AppendLine($"Date: {today:MMM dd, yyyy}");
                sb.AppendLine();

                if (todayFollowUps.Count > 0)
                {
                    sb.AppendLine("📌 *Today's Tasks:*");
                    foreach (var f in todayFollowUps)
                        sb.AppendLine($"- {f.Lead.Name} ({f.Priority})");
                }

                if (yesterdayPending.Count > 0)
                {
                    sb.AppendLine();
                    sb.AppendLine("⚠️ *Overdue/Pending:*");
                    foreach (var f in yesterdayPending)
                        sb.AppendLine($"- {f.Lead.Name} ({f.FollowUpDate:dd MMM})");
                }

                message = sb.ToString();
            }
            else
            {
                // 10 PM: Taken today + Pending yesterday/today + Upcoming tomorrow
                var takenToday = await db.FollowUps
                    .Include(f => f.Lead)
                    .Where(f => !f.IsDeleted && f.CompletedAt != null && f.CompletedAt.Value.Date == DateTime.Today)
                    .ToListAsync(ct);

                var stillPending = await db.FollowUps
                    .Include(f => f.Lead)
                    .Where(f => !f.IsDeleted && f.CompletedAt == null && f.FollowUpDate <= today)
                    .ToListAsync(ct);

                var tomorrowPreview = await db.FollowUps
                    .Include(f => f.Lead)
                    .Where(f => !f.IsDeleted && f.CompletedAt == null && f.FollowUpDate == tomorrow)
                    .ToListAsync(ct);

                var sb = new StringBuilder();
                sb.AppendLine("🌑 *Evening End-of-Day Report*");
                sb.AppendLine();

                sb.AppendLine($"✅ *Completed Today:* {takenToday.Count}");
                if (takenToday.Count > 0)
                {
                    foreach (var f in takenToday.Take(5)) // Show first 5
                        sb.AppendLine($"- {f.Lead.Name}");
                    if (takenToday.Count > 5) sb.AppendLine($"- ...and {takenToday.Count - 5} more");
                }

                sb.AppendLine();
                sb.AppendLine($"🔴 *Still Pending:* {stillPending.Count}");
                
                sb.AppendLine();
                sb.AppendLine($"📅 *Tomorrow's Preview:* {tomorrowPreview.Count}");
                if (tomorrowPreview.Count > 0)
                {
                    foreach (var f in tomorrowPreview.Take(3))
                        sb.AppendLine($"- {f.Lead.Name}");
                }

                message = sb.ToString();
            }

            foreach (var number in _targetNumbers)
            {
                await notifier.SendMessageAsync(number, message);
            }
        }
    }
}
