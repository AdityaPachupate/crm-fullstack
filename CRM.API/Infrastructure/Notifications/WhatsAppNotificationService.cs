using System.Web;
using CRM.API.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace CRM.API.Infrastructure.Notifications
{
    public class WhatsAppNotificationService(
        ILogger<WhatsAppNotificationService> logger,
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration
    ) : INotificationService
    {
        private readonly string? _apiKey = configuration["CALLMEBOT_API_KEY"];

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

        public async Task SendMessageAsync(string phoneNumber, string message)
        {
            if (string.IsNullOrEmpty(_apiKey))
            {
                logger.LogWarning("CallMeBot API Key is missing. Skipping message to {Phone}", phoneNumber);
                return;
            }

            try
            {
                var client = httpClientFactory.CreateClient();
                // CallMeBot format: https://api.callmebot.com/whatsapp.php?phone=[phone]&text=[text]&apikey=[apikey]
                var encodedMessage = HttpUtility.UrlEncode(message);
                var url = $"https://api.callmebot.com/whatsapp.php?phone={phoneNumber}&text={encodedMessage}&apikey={_apiKey}";

                var response = await client.GetAsync(url);
                if (response.IsSuccessStatusCode)
                {
                    logger.LogInformation("WhatsApp message sent to {Phone} via CallMeBot.", phoneNumber);
                }
                else
                {
                    var error = await response.Content.ReadAsStringAsync();
                    logger.LogError("Failed to send WhatsApp message to {Phone}. Status: {Status}, Error: {Error}", 
                        phoneNumber, response.StatusCode, error);
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Exception while sending WhatsApp message to {Phone}", phoneNumber);
            }
        }
    }
}
