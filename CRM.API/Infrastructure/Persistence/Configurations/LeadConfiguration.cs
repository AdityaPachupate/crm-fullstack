using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CRM.API.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CRM.API.Infrastructure.Persistence.Configurations
{
    public class LeadConfiguration : IEntityTypeConfiguration<Lead>
    {
        public void Configure(EntityTypeBuilder<Lead> builder)
        {
            builder.HasKey(l => l.Id);
            builder.Property(l => l.Id).HasDefaultValueSql("gen_random_uuid()");
            builder.Property(l => l.Name).IsRequired().HasMaxLength(100);
            builder.Property(l => l.Phone).IsRequired().HasMaxLength(15);
            builder.Property(l => l.Source).IsRequired().HasMaxLength(50);
            builder.Property(l => l.Reason).IsRequired().HasMaxLength(50);
            builder.Property(l => l.Status).HasConversion<string>();
            builder.Property(l => l.CreatedAt).HasDefaultValueSql("now()");
            builder.HasIndex(l => l.Phone).IsUnique();
            builder.HasQueryFilter(l => !l.IsDeleted);

        }
    }
}