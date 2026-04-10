using CRM.API.Common.Enums;
using CRM.API.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CRM.API.Infrastructure.Persistence.Configurations
{
    public class FollowUpConfiguration : IEntityTypeConfiguration<FollowUp>
    {
        public void Configure(EntityTypeBuilder<FollowUp> builder)
        {
            builder.Property(x => x.Priority)
                .HasConversion<string>();

            builder.Property(x => x.Outcome)
                .HasConversion<string>();

            builder.Property(x => x.Status)
                .HasConversion<string>();

            builder.HasQueryFilter(f => !f.IsDeleted);
        }
    }
}
