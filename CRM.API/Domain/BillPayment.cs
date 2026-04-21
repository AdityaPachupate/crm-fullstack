using System;

namespace CRM.API.Domain
{
    public class BillPayment
    {
        public Guid Id { get; set; }
        public Guid BillId { get; set; }
        
        public decimal Amount { get; set; }
        public DateTime DatePaid { get; set; }
        
        // Soft delete fields
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }

        // Navigation
        public Bill Bill { get; set; } = null!;
    }
}
