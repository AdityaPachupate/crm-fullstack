using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CRM.API.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdateLeadSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ClinicId",
                table: "Leads");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Leads",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Leads");

            migrationBuilder.AddColumn<Guid>(
                name: "ClinicId",
                table: "Leads",
                type: "uuid",
                nullable: true);
        }
    }
}
