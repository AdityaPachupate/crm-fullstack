using System;
using CRM.API.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CRM.API.Infrastructure.Persistence.Configurations;

public class EnrollmentConfiguration : IEntityTypeConfiguration<Enrollment>
{
    public void Configure(EntityTypeBuilder<Enrollment> builder)
    {
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasDefaultValueSql("gen_random_uuid()");
        builder.Property(e => e.PackageCostSnapshot).HasColumnType("decimal(10,2)");
        builder.Property(e => e.PackageDurationSnapshot).IsRequired();
        builder.Property(e => e.CreatedAt).HasDefaultValueSql("now()");
        builder.HasOne(e => e.Lead).WithMany(l => l.Enrollments).HasForeignKey(e => e.LeadId);
        builder.HasOne(e => e.Package).WithMany().HasForeignKey(e => e.PackageId);
        builder.HasOne(e => e.Bill)
               .WithOne(b => b.Enrollment)
               .HasForeignKey<Bill>(b => b.EnrollmentId);
        builder.HasQueryFilter(e => !e.IsDeleted);
    }
}
