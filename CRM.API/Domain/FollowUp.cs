using CRM.API.Common.Enums;

namespace CRM.API.Domain
{
    public class FollowUp
    {
        public Guid Id { get; set; }
        public Guid LeadId { get; set; }
        public DateOnly FollowUpDate { get; set; }
        public string Notes { get; set; } = string.Empty;
        public string Source { get; set; } = string.Empty; //(LookupValue.Code)
        public FollowUpPriority Priority { get; set; }
        public FollowUpOutcome Outcome { get; set; }
        public FollowUpStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
        public Lead Lead { get; set; } = null!;
    }
}