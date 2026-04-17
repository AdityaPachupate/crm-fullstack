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

            builder.HasData(
                new Medicine { Id = new Guid("c1000000-0000-0000-0000-000000000001"), Name = "Ashwagandha Extract", Price = 45.00m, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Medicine { Id = new Guid("c1000000-0000-0000-0000-000000000002"), Name = "Brahmi Vitality", Price = 35.00m, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Medicine { Id = new Guid("c1000000-0000-0000-0000-000000000003"), Name = "Triphala Cleanse", Price = 25.00m, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
                new Medicine { Id = new Guid("c1000000-0000-0000-0000-000000000004"), Name = "Shatavari Glow", Price = 55.00m, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
            );
        }
    }
}
