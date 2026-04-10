using CRM.API.Domain;
using Microsoft.EntityFrameworkCore;

namespace CRM.API.Infrastructure.Persistence
{
    public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
    {
        public DbSet<Lead> Leads => Set<Lead>();
        public DbSet<FollowUp> FollowUps => Set<FollowUp>();
        public DbSet<Package> Packages => Set<Package>();
        public DbSet<Enrollment> Enrollments => Set<Enrollment>();
        public DbSet<RejoinRecord> RejoinRecords => Set<RejoinRecord>();
        public DbSet<Bill> Bills => Set<Bill>();
        public DbSet<Medicine> Medicines => Set<Medicine>();
        public DbSet<BillItem> BillItems => Set<BillItem>();
        public DbSet<LookupValue> LookupValues => Set<LookupValue>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        }
    }
}