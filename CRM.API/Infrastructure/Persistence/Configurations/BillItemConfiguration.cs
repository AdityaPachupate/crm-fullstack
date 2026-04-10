using CRM.API.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CRM.API.Infrastructure.Persistence.Configurations
{
    public class BillItemConfiguration : IEntityTypeConfiguration<BillItem>
    {
        public void Configure(EntityTypeBuilder<BillItem> builder)
        {
            builder.HasKey(bi => bi.Id);
            builder.Property(bi => bi.Id).HasDefaultValueSql("gen_random_uuid()");
            builder.Property(bi => bi.UnitPriceSnapshot).HasColumnType("decimal(18,2)");
            
            builder.HasOne(bi => bi.Bill)
                .WithMany(b => b.Items)
                .HasForeignKey(bi => bi.BillId);
                
            builder.HasOne(bi => bi.Medicine)
                .WithMany()
                .HasForeignKey(bi => bi.MedicineId);
        }
    }
}
