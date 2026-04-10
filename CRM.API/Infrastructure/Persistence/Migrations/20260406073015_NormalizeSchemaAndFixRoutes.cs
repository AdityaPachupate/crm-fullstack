using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CRM.API.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class NormalizeSchemaAndFixRoutes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "IsActive",
                table: "LookupValues",
                newName: "IsDeleted");

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "RejoinRecords",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "RejoinRecords",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "RejoinRecords",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "Medicines",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Medicines",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Medicines",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "LookupValues",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "LookupValues",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "FollowUps",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Enrollments",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Bills",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.UpdateData(
                table: "LookupValues",
                keyColumn: "Id",
                keyValue: new Guid("a1000000-0000-0000-0000-000000000001"),
                columns: new[] { "DeletedAt", "IsDeleted", "UpdatedAt" },
                values: new object[] { null, false, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified) });

            migrationBuilder.UpdateData(
                table: "LookupValues",
                keyColumn: "Id",
                keyValue: new Guid("a1000000-0000-0000-0000-000000000002"),
                columns: new[] { "DeletedAt", "IsDeleted", "UpdatedAt" },
                values: new object[] { null, false, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified) });

            migrationBuilder.UpdateData(
                table: "LookupValues",
                keyColumn: "Id",
                keyValue: new Guid("a1000000-0000-0000-0000-000000000003"),
                columns: new[] { "DeletedAt", "IsDeleted", "UpdatedAt" },
                values: new object[] { null, false, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified) });

            migrationBuilder.UpdateData(
                table: "LookupValues",
                keyColumn: "Id",
                keyValue: new Guid("a1000000-0000-0000-0000-000000000004"),
                columns: new[] { "DeletedAt", "IsDeleted", "UpdatedAt" },
                values: new object[] { null, false, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified) });

            migrationBuilder.UpdateData(
                table: "LookupValues",
                keyColumn: "Id",
                keyValue: new Guid("a1000000-0000-0000-0000-000000000005"),
                columns: new[] { "DeletedAt", "IsDeleted", "UpdatedAt" },
                values: new object[] { null, false, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified) });

            migrationBuilder.UpdateData(
                table: "LookupValues",
                keyColumn: "Id",
                keyValue: new Guid("a1000000-0000-0000-0000-000000000006"),
                columns: new[] { "DeletedAt", "IsDeleted", "UpdatedAt" },
                values: new object[] { null, false, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified) });

            migrationBuilder.UpdateData(
                table: "LookupValues",
                keyColumn: "Id",
                keyValue: new Guid("a1000000-0000-0000-0000-000000000007"),
                columns: new[] { "DeletedAt", "IsDeleted", "UpdatedAt" },
                values: new object[] { null, false, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified) });

            migrationBuilder.UpdateData(
                table: "LookupValues",
                keyColumn: "Id",
                keyValue: new Guid("a1000000-0000-0000-0000-000000000008"),
                columns: new[] { "DeletedAt", "IsDeleted", "UpdatedAt" },
                values: new object[] { null, false, new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "RejoinRecords");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "RejoinRecords");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "RejoinRecords");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Medicines");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Medicines");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Medicines");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "LookupValues");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "LookupValues");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "FollowUps");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Enrollments");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Bills");

            migrationBuilder.RenameColumn(
                name: "IsDeleted",
                table: "LookupValues",
                newName: "IsActive");

            migrationBuilder.UpdateData(
                table: "LookupValues",
                keyColumn: "Id",
                keyValue: new Guid("a1000000-0000-0000-0000-000000000001"),
                column: "IsActive",
                value: true);

            migrationBuilder.UpdateData(
                table: "LookupValues",
                keyColumn: "Id",
                keyValue: new Guid("a1000000-0000-0000-0000-000000000002"),
                column: "IsActive",
                value: true);

            migrationBuilder.UpdateData(
                table: "LookupValues",
                keyColumn: "Id",
                keyValue: new Guid("a1000000-0000-0000-0000-000000000003"),
                column: "IsActive",
                value: true);

            migrationBuilder.UpdateData(
                table: "LookupValues",
                keyColumn: "Id",
                keyValue: new Guid("a1000000-0000-0000-0000-000000000004"),
                column: "IsActive",
                value: true);

            migrationBuilder.UpdateData(
                table: "LookupValues",
                keyColumn: "Id",
                keyValue: new Guid("a1000000-0000-0000-0000-000000000005"),
                column: "IsActive",
                value: true);

            migrationBuilder.UpdateData(
                table: "LookupValues",
                keyColumn: "Id",
                keyValue: new Guid("a1000000-0000-0000-0000-000000000006"),
                column: "IsActive",
                value: true);

            migrationBuilder.UpdateData(
                table: "LookupValues",
                keyColumn: "Id",
                keyValue: new Guid("a1000000-0000-0000-0000-000000000007"),
                column: "IsActive",
                value: true);

            migrationBuilder.UpdateData(
                table: "LookupValues",
                keyColumn: "Id",
                keyValue: new Guid("a1000000-0000-0000-0000-000000000008"),
                column: "IsActive",
                value: true);
        }
    }
}
