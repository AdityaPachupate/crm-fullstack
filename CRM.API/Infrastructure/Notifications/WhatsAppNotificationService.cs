using CRM.API.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace CRM.API.Infrastructure.Notifications
{
    public class WhatsAppNotificationService(ILogger<WhatsAppNotificationService> logger)
        : INotificationService
    {
        public async Task SendFollowUpCreatedAsync(Guid leadId, DateOnly date)
        {
            logger.LogInformation("FollowUp scheduled for Lead {LeadId} on {Date}", leadId, date);
            await Task.CompletedTask;
        }

        public async Task SendEnrollmentConfirmedAsync(
            Guid leadId, string packageName, DateOnly startDate)
        {
            logger.LogInformation("Enrollment confirmed — Lead {LeadId}: {Package} from {Start}",
                leadId, packageName, startDate);
            await Task.CompletedTask;
        }

        public async Task SendRejoinConfirmedAsync(
            Guid leadId, string packageName, DateOnly startDate)
        {
            logger.LogInformation("Rejoin confirmed — Lead {LeadId}: {Package} from {Start}",
                leadId, packageName, startDate);
            await Task.CompletedTask;
        }
    }
}
