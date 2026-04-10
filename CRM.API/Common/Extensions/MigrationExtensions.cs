using CRM.API.Infrastructure.Persistence;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace CRM.API.Common.Extensions
{
    public static class MigrationExtensions
    {
        public static void MigrateDatabase(this WebApplication app)
        {
            using IServiceScope scope = app.Services.CreateScope();
            AppDbContext db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            db.Database.Migrate();
        }
    }
}
