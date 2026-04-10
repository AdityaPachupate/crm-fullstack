using System;
using CRM.API.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CRM.API.Infrastructure.Persistence.Configurations;

public class LookupValueConfiguration : IEntityTypeConfiguration<LookupValue>
{
    public void Configure(EntityTypeBuilder<LookupValue> builder)
    {
        builder.HasKey(l => l.Id);
        builder.Property(l => l.Id).HasDefaultValueSql("gen_random_uuid()");
        builder.Property(l => l.Category).IsRequired().HasMaxLength(50);
        builder.Property(l => l.Code).IsRequired().HasMaxLength(50);
        builder.Property(l => l.DisplayName).IsRequired().HasMaxLength(100);
        builder.Property(l => l.CreatedAt).HasDefaultValueSql("now()");
        // Composite unique index — same code cannot appear twice in same category
        builder.HasIndex(l => new { l.Category, l.Code }).IsUnique();

        // Seed default values — app works on first run without manual setup
        // Use fixed GUIDs — Guid.NewGuid() in HasData causes spurious migration diffs
        builder.HasData(
            new LookupValue { Id = Guid.Parse("a1000000-0000-0000-0000-000000000001"), Category = "LeadSource", Code = "WalkIn",      DisplayName = "Walk-In",      CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new LookupValue { Id = Guid.Parse("a1000000-0000-0000-0000-000000000002"), Category = "LeadSource", Code = "Referral",    DisplayName = "Referral",     CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new LookupValue { Id = Guid.Parse("a1000000-0000-0000-0000-000000000003"), Category = "LeadSource", Code = "SocialMedia", DisplayName = "Social Media", CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new LookupValue { Id = Guid.Parse("a1000000-0000-0000-0000-000000000004"), Category = "LeadSource", Code = "Website",     DisplayName = "Website",      CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new LookupValue { Id = Guid.Parse("a1000000-0000-0000-0000-000000000005"), Category = "LeadReason", Code = "BackPain",    DisplayName = "Back Pain",    CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new LookupValue { Id = Guid.Parse("a1000000-0000-0000-0000-000000000006"), Category = "LeadReason", Code = "Stress",      DisplayName = "Stress",       CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new LookupValue { Id = Guid.Parse("a1000000-0000-0000-0000-000000000007"), Category = "LeadReason", Code = "Detox",       DisplayName = "Detox",        CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
            new LookupValue { Id = Guid.Parse("a1000000-0000-0000-0000-000000000008"), Category = "LeadReason", Code = "WeightLoss",  DisplayName = "Weight Loss",  CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
        );
    }
}