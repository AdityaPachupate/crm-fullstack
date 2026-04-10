namespace CRM.API.Domain
{
    public class BillItem
    {
        public Guid Id { get; set; }
        public Guid BillId { get; set; }
        public Guid MedicineId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPriceSnapshot { get; set; }
        
        public Bill Bill { get; set; } = null!;
        public Medicine Medicine { get; set; } = null!;
    }
}
