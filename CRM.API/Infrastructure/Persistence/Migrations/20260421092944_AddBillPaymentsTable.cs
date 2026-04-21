using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CRM.API.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddBillPaymentsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BillPayments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BillId = table.Column<Guid>(type: "uuid", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric", nullable: false),
                    DatePaid = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BillPayments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BillPayments_Bills_BillId",
                        column: x => x.BillId,
                        principalTable: "Bills",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

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

            migrationBuilder.CreateIndex(
                name: "IX_BillPayments_BillId",
                table: "BillPayments",
                column: "BillId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BillPayments");

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
    }
}
