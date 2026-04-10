using CRM.API.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CRM.API.Infrastructure.Persistence.Configurations
{
    public class PackageConfiguration : IEntityTypeConfiguration<Package>
    {
        public void Configure(EntityTypeBuilder<Package> builder)
        {
            builder.HasKey(p => p.Id);
            builder.Property(p => p.Id).HasDefaultValueSql("gen_random_uuid()");
            builder.Property(p => p.Name).IsRequired().HasMaxLength(100);
            builder.Property(p => p.DurationInDays).IsRequired();
            builder.Property(p => p.Cost).HasColumnType("decimal(10,2)");
            builder.Property(p => p.CreatedAt).HasDefaultValueSql("now()");
            builder.Property(p => p.UpdatedAt).HasDefaultValueSql("now()");

            builder.HasIndex(p => p.Name).IsUnique().HasFilter("\"IsDeleted\" = false");
            builder.HasQueryFilter(p => !p.IsDeleted);

        }
    }
}