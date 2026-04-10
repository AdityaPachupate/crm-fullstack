using CRM.API.Common.Enums;

namespace CRM.API.Domain
{
    public class Enrollment
    {
        public Guid Id { get; set; }
        public Guid LeadId { get; set; }
        public Guid PackageId { get; set; }
        public Package Package { get; set; } = null!;
        public decimal PackageCostSnapshot { get; set; }
        public int PackageDurationSnapshot { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public Lead Lead { get; set; } = null!;
        public Bill? Bill { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
    }
}