using CRM.API.Common.Enums;
using System;
using System.Collections.Generic;

namespace CRM.API.Domain
{
    public class Lead
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public LeadStatus Status { get; set; }
        public string Source { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
        public bool IsDeleted { get; set; }
        
        public List<FollowUp> FollowUps { get; set; } = new();
        public List<Enrollment> Enrollments { get; set; } = new();
        public List<Bill> Bills { get; set; } = new();
        public List<RejoinRecord> RejoinRecords { get; set; } = new();
    }
}