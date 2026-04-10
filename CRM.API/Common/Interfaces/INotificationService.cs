namespace CRM.API.Common.Interfaces
{
    public interface INotificationService
    {
        Task SendFollowUpCreatedAsync(Guid leadId, DateOnly date);
        Task SendEnrollmentConfirmedAsync(Guid leadId, string packageName, DateOnly startDate);
        Task SendRejoinConfirmedAsync(Guid leadId, string packageName, DateOnly startDate);
    }
}
