using CRM.API.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CRM.API.Infrastructure.Persistence.Configurations
{
    public class MedicineConfiguration : IEntityTypeConfiguration<Medicine>
    {
        public void Configure(EntityTypeBuilder<Medicine> builder)
        {
            builder.HasKey(m => m.Id);
            builder.Property(m => m.Id).HasDefaultValueSql("gen_random_uuid()");
            builder.Property(m => m.Name).IsRequired().HasMaxLength(200);
            builder.Property(m => m.Price).HasColumnType("decimal(18,2)");
            builder.Property(m => m.CreatedAt).HasDefaultValueSql("now()");
            
            builder.HasQueryFilter(m => m.IsActive && !m.IsDeleted);
        }
    }
}
