using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CRM.API.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSoftDeleteToPackages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ClinicId",
                table: "Packages");

            migrationBuilder.DropColumn(
                name: "ClinicId",
                table: "Enrollments");

            migrationBuilder.RenameColumn(
                name: "IsActive",
                table: "Packages",
                newName: "IsDeleted");

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "Packages",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Packages",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "now()");

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAt",
                table: "FollowUps",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "FollowUps",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Outcome",
                table: "FollowUps",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Packages_Name",
                table: "Packages",
                column: "Name",
                unique: true,
                filter: "\"IsDeleted\" = false");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Packages_Name",
                table: "Packages");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "Packages");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Packages");

            migrationBuilder.DropColumn(
                name: "DeletedAt",
                table: "FollowUps");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "FollowUps");

            migrationBuilder.DropColumn(
                name: "Outcome",
                table: "FollowUps");

            migrationBuilder.RenameColumn(
                name: "IsDeleted",
                table: "Packages",
                newName: "IsActive");

            migrationBuilder.AddColumn<Guid>(
                name: "ClinicId",
                table: "Packages",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ClinicId",
                table: "Enrollments",
                type: "uuid",
                nullable: true);
        }
    }
}
