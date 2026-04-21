using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CRM.API.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RemovePaymentHistoryJsonColumnFinal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PaymentHistoryJson",
                table: "Bills");

            migrationBuilder.UpdateData(
                table: "Medicines",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 21, 9, 49, 33, 846, DateTimeKind.Utc).AddTicks(3245), new DateTime(2026, 4, 21, 9, 49, 33, 846, DateTimeKind.Utc).AddTicks(3249) });

            migrationBuilder.UpdateData(
                table: "Medicines",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 21, 9, 49, 33, 846, DateTimeKind.Utc).AddTicks(3250), new DateTime(2026, 4, 21, 9, 49, 33, 846, DateTimeKind.Utc).AddTicks(3250) });

            migrationBuilder.UpdateData(
                table: "Medicines",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 21, 9, 49, 33, 846, DateTimeKind.Utc).AddTicks(3252), new DateTime(2026, 4, 21, 9, 49, 33, 846, DateTimeKind.Utc).AddTicks(3252) });

            migrationBuilder.UpdateData(
                table: "Medicines",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 21, 9, 49, 33, 846, DateTimeKind.Utc).AddTicks(3254), new DateTime(2026, 4, 21, 9, 49, 33, 846, DateTimeKind.Utc).AddTicks(3254) });

            migrationBuilder.UpdateData(
                table: "Packages",
                keyColumn: "Id",
                keyValue: new Guid("b1000000-0000-0000-0000-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 21, 9, 49, 33, 846, DateTimeKind.Utc).AddTicks(6909), new DateTime(2026, 4, 21, 9, 49, 33, 846, DateTimeKind.Utc).AddTicks(6917) });

            migrationBuilder.UpdateData(
                table: "Packages",
                keyColumn: "Id",
                keyValue: new Guid("b1000000-0000-0000-0000-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 21, 9, 49, 33, 846, DateTimeKind.Utc).AddTicks(6919), new DateTime(2026, 4, 21, 9, 49, 33, 846, DateTimeKind.Utc).AddTicks(6919) });

            migrationBuilder.UpdateData(
                table: "Packages",
                keyColumn: "Id",
                keyValue: new Guid("b1000000-0000-0000-0000-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 21, 9, 49, 33, 846, DateTimeKind.Utc).AddTicks(6921), new DateTime(2026, 4, 21, 9, 49, 33, 846, DateTimeKind.Utc).AddTicks(6921) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PaymentHistoryJson",
                table: "Bills",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "Medicines",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 21, 9, 29, 42, 586, DateTimeKind.Utc).AddTicks(5220), new DateTime(2026, 4, 21, 9, 29, 42, 586, DateTimeKind.Utc).AddTicks(5222) });

            migrationBuilder.UpdateData(
                table: "Medicines",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 21, 9, 29, 42, 586, DateTimeKind.Utc).AddTicks(5224), new DateTime(2026, 4, 21, 9, 29, 42, 586, DateTimeKind.Utc).AddTicks(5224) });

            migrationBuilder.UpdateData(
                table: "Medicines",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 21, 9, 29, 42, 586, DateTimeKind.Utc).AddTicks(5226), new DateTime(2026, 4, 21, 9, 29, 42, 586, DateTimeKind.Utc).AddTicks(5226) });

            migrationBuilder.UpdateData(
                table: "Medicines",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 21, 9, 29, 42, 586, DateTimeKind.Utc).AddTicks(5228), new DateTime(2026, 4, 21, 9, 29, 42, 586, DateTimeKind.Utc).AddTicks(5228) });

            migrationBuilder.UpdateData(
                table: "Packages",
                keyColumn: "Id",
                keyValue: new Guid("b1000000-0000-0000-0000-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 21, 9, 29, 42, 586, DateTimeKind.Utc).AddTicks(8578), new DateTime(2026, 4, 21, 9, 29, 42, 586, DateTimeKind.Utc).AddTicks(8580) });

            migrationBuilder.UpdateData(
                table: "Packages",
                keyColumn: "Id",
                keyValue: new Guid("b1000000-0000-0000-0000-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 21, 9, 29, 42, 586, DateTimeKind.Utc).AddTicks(8582), new DateTime(2026, 4, 21, 9, 29, 42, 586, DateTimeKind.Utc).AddTicks(8582) });

            migrationBuilder.UpdateData(
                table: "Packages",
                keyColumn: "Id",
                keyValue: new Guid("b1000000-0000-0000-0000-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 21, 9, 29, 42, 586, DateTimeKind.Utc).AddTicks(8585), new DateTime(2026, 4, 21, 9, 29, 42, 586, DateTimeKind.Utc).AddTicks(8585) });
        }
    }
}
