using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CRM.API.Domain
{
    public class RejoinRecord
    {
        public Guid Id { get; set; }
        public Guid LeadId { get; set; }
        public Guid PackageId { get; set; }
        public decimal PackageCostSnapshot { get; set; }
        public int PackageDurationSnapshot { get; set; }
        public DateOnly StartDate { get; set; }
        public DateOnly EndDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
        public Lead Lead { get; set; } = null!;
        public Package Package { get; set; } = null!;
        public Bill? Bill { get; set; }
    }
}