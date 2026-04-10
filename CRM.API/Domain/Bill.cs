using System;
using System.Collections.Generic;

namespace CRM.API.Domain
{
    public class Bill
    {
        public Guid Id { get; set; }
        public Guid LeadId { get; set; }
        public Guid? EnrollmentId { get; set; }
        public Guid? RejoinRecordId { get; set; }

        /// <summary>
        /// Represents the Package Cost ONLY.
        /// </summary>
        public decimal InitialAmount { get; set; }

        /// <summary>
        /// Total amount processed from itemized medicines.
        /// </summary>
        public decimal MedicineBillingAmount { get; set; }

        /// <summary>
        /// Total cash received (applied against both Package and Medicines).
        /// </summary>
        public decimal AmountPaid { get; set; }

        /// <summary>
        /// Remaining balance ( (InitialAmount + MedicineBillingAmount) - AmountPaid )
        /// </summary>
        public decimal PendingAmount { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }
        public Lead Lead { get; set; } = null!;
        public Enrollment? Enrollment { get; set; }
        public RejoinRecord? RejoinRecord { get; set; }
        public List<BillItem> Items { get; set; } = new();
    }
}