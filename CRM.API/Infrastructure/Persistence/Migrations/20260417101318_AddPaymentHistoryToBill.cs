using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CRM.API.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentHistoryToBill : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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
                values: new object[] { new DateTime(2026, 4, 17, 10, 13, 14, 281, DateTimeKind.Utc).AddTicks(522), new DateTime(2026, 4, 17, 10, 13, 14, 281, DateTimeKind.Utc).AddTicks(525) });

            migrationBuilder.UpdateData(
                table: "Medicines",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 17, 10, 13, 14, 281, DateTimeKind.Utc).AddTicks(529), new DateTime(2026, 4, 17, 10, 13, 14, 281, DateTimeKind.Utc).AddTicks(530) });

            migrationBuilder.UpdateData(
                table: "Medicines",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 17, 10, 13, 14, 281, DateTimeKind.Utc).AddTicks(534), new DateTime(2026, 4, 17, 10, 13, 14, 281, DateTimeKind.Utc).AddTicks(535) });

            migrationBuilder.UpdateData(
                table: "Medicines",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 17, 10, 13, 14, 281, DateTimeKind.Utc).AddTicks(539), new DateTime(2026, 4, 17, 10, 13, 14, 281, DateTimeKind.Utc).AddTicks(540) });

            migrationBuilder.UpdateData(
                table: "Packages",
                keyColumn: "Id",
                keyValue: new Guid("b1000000-0000-0000-0000-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 17, 10, 13, 14, 282, DateTimeKind.Utc).AddTicks(416), new DateTime(2026, 4, 17, 10, 13, 14, 282, DateTimeKind.Utc).AddTicks(419) });

            migrationBuilder.UpdateData(
                table: "Packages",
                keyColumn: "Id",
                keyValue: new Guid("b1000000-0000-0000-0000-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 17, 10, 13, 14, 282, DateTimeKind.Utc).AddTicks(425), new DateTime(2026, 4, 17, 10, 13, 14, 282, DateTimeKind.Utc).AddTicks(426) });

            migrationBuilder.UpdateData(
                table: "Packages",
                keyColumn: "Id",
                keyValue: new Guid("b1000000-0000-0000-0000-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 17, 10, 13, 14, 282, DateTimeKind.Utc).AddTicks(430), new DateTime(2026, 4, 17, 10, 13, 14, 282, DateTimeKind.Utc).AddTicks(431) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PaymentHistoryJson",
                table: "Bills");

            migrationBuilder.UpdateData(
                table: "Medicines",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 14, 10, 15, 47, 343, DateTimeKind.Utc).AddTicks(3399), new DateTime(2026, 4, 14, 10, 15, 47, 343, DateTimeKind.Utc).AddTicks(3409) });

            migrationBuilder.UpdateData(
                table: "Medicines",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 14, 10, 15, 47, 343, DateTimeKind.Utc).AddTicks(3415), new DateTime(2026, 4, 14, 10, 15, 47, 343, DateTimeKind.Utc).AddTicks(3416) });

            migrationBuilder.UpdateData(
                table: "Medicines",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 14, 10, 15, 47, 343, DateTimeKind.Utc).AddTicks(3421), new DateTime(2026, 4, 14, 10, 15, 47, 343, DateTimeKind.Utc).AddTicks(3423) });

            migrationBuilder.UpdateData(
                table: "Medicines",
                keyColumn: "Id",
                keyValue: new Guid("c1000000-0000-0000-0000-000000000004"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 14, 10, 15, 47, 343, DateTimeKind.Utc).AddTicks(3429), new DateTime(2026, 4, 14, 10, 15, 47, 343, DateTimeKind.Utc).AddTicks(3430) });

            migrationBuilder.UpdateData(
                table: "Packages",
                keyColumn: "Id",
                keyValue: new Guid("b1000000-0000-0000-0000-000000000001"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 14, 10, 15, 47, 344, DateTimeKind.Utc).AddTicks(4831), new DateTime(2026, 4, 14, 10, 15, 47, 344, DateTimeKind.Utc).AddTicks(4834) });

            migrationBuilder.UpdateData(
                table: "Packages",
                keyColumn: "Id",
                keyValue: new Guid("b1000000-0000-0000-0000-000000000002"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 14, 10, 15, 47, 344, DateTimeKind.Utc).AddTicks(4841), new DateTime(2026, 4, 14, 10, 15, 47, 344, DateTimeKind.Utc).AddTicks(4843) });

            migrationBuilder.UpdateData(
                table: "Packages",
                keyColumn: "Id",
                keyValue: new Guid("b1000000-0000-0000-0000-000000000003"),
                columns: new[] { "CreatedAt", "UpdatedAt" },
                values: new object[] { new DateTime(2026, 4, 14, 10, 15, 47, 344, DateTimeKind.Utc).AddTicks(4849), new DateTime(2026, 4, 14, 10, 15, 47, 344, DateTimeKind.Utc).AddTicks(4850) });
        }
    }
}
