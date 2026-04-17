using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace CRM.API.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SeedPackagesAndMedicines : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Medicines",
                columns: new[] { "Id", "CreatedAt", "DeletedAt", "IsActive", "IsDeleted", "Name", "Price", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("c1000000-0000-0000-0000-000000000001"), new DateTime(2026, 4, 14, 10, 15, 47, 343, DateTimeKind.Utc).AddTicks(3399), null, true, false, "Ashwagandha Extract", 45.00m, new DateTime(2026, 4, 14, 10, 15, 47, 343, DateTimeKind.Utc).AddTicks(3409) },
                    { new Guid("c1000000-0000-0000-0000-000000000002"), new DateTime(2026, 4, 14, 10, 15, 47, 343, DateTimeKind.Utc).AddTicks(3415), null, true, false, "Brahmi Vitality", 35.00m, new DateTime(2026, 4, 14, 10, 15, 47, 343, DateTimeKind.Utc).AddTicks(3416) },
                    { new Guid("c1000000-0000-0000-0000-000000000003"), new DateTime(2026, 4, 14, 10, 15, 47, 343, DateTimeKind.Utc).AddTicks(3421), null, true, false, "Triphala Cleanse", 25.00m, new DateTime(2026, 4, 14, 10, 15, 47, 343, DateTimeKind.Utc).AddTicks(3423) },
                    { new Guid("c1000000-0000-0000-0000-000000000004"), new DateTime(2026, 4, 14, 10, 15, 47, 343, DateTimeKind.Utc).AddTicks(3429), null, true, false, "Shatavari Glow", 55.00m, new DateTime(2026, 4, 14, 10, 15, 47, 343, DateTimeKind.Utc).AddTicks(3430) }
                });

            migrationBuilder.InsertData(
                table: "Packages",
                columns: new[] { "Id", "Cost", "CreatedAt", "DeletedAt", "DurationInDays", "IsDeleted", "Name", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("b1000000-0000-0000-0000-000000000001"), 299.00m, new DateTime(2026, 4, 14, 10, 15, 47, 344, DateTimeKind.Utc).AddTicks(4831), null, 7, false, "Detox Starter", new DateTime(2026, 4, 14, 10, 15, 47, 344, DateTimeKind.Utc).AddTicks(4834) },
                    { new Guid("b1000000-0000-0000-0000-000000000002"), 549.00m, new DateTime(2026, 4, 14, 10, 15, 47, 344, DateTimeKind.Utc).AddTicks(4841), null, 14, false, "Wellness Elite", new DateTime(2026, 4, 14, 10, 15, 47, 344, DateTimeKind.Utc).AddTicks(4843) },
                    { new Guid("b1000000-0000-0000-0000-000000000003"), 999.00m, new DateTime(2026, 4, 14, 10, 15, 47, 344, DateTimeKind.Utc).AddTicks(4849), null, 30, false, "Full Rejuvenation", new DateTime(2026, 4, 14, 10, 15, 47, 344, DateTimeKind.Utc).AddTicks(4850) }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Medicines",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000001"));

            migrationBuilder.DeleteData(
                table: "Medicines",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000002"));

            migrationBuilder.DeleteData(
                table: "Medicines",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000003"));

            migrationBuilder.DeleteData(
                table: "Medicines",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000004"));

            migrationBuilder.DeleteData(
                table: "Packages",
                keyColumn: "Id",
                keyValue: new Guid("b1000000-0000-0000-0000-000000000001"));

            migrationBuilder.DeleteData(
                table: "Packages",
                keyColumn: "Id",
                keyValue: new Guid("b1000000-0000-0000-0000-000000000002"));

            migrationBuilder.DeleteData(
                table: "Packages",
                keyColumn: "Id",
                keyValue: new Guid("b1000000-0000-0000-0000-000000000003"));
        }
    }
}
