using System;
using CRM.API.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CRM.API.Infrastructure.Persistence.Configurations;

public class RejoinRecordConfiguration : IEntityTypeConfiguration<RejoinRecord>
{
    public void Configure(EntityTypeBuilder<RejoinRecord> builder)
    {
        builder.HasKey(r => r.Id);
        builder.Property(r => r.Id).HasDefaultValueSql("gen_random_uuid()");
        builder.Property(r => r.PackageCostSnapshot).HasColumnType("decimal(10,2)");
        builder.Property(r => r.PackageDurationSnapshot).IsRequired();
        builder.Property(r => r.CreatedAt).HasDefaultValueSql("now()");
        builder.HasOne(r => r.Lead).WithMany(l => l.RejoinRecords).HasForeignKey(r => r.LeadId);
        builder.HasOne(r => r.Package).WithMany().HasForeignKey(r => r.PackageId);
        builder.HasOne(r => r.Bill)
               .WithOne(b => b.RejoinRecord)
               .HasForeignKey<Bill>(b => b.RejoinRecordId);

        builder.HasQueryFilter(r => !r.IsDeleted);
    }
}
