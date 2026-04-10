using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CRM.API.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSourceAndPriorityToFollowUp : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "FollowUps",
                type: "text",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<string>(
                name: "Priority",
                table: "FollowUps",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Source",
                table: "FollowUps",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Priority",
                table: "FollowUps");

            migrationBuilder.DropColumn(
                name: "Source",
                table: "FollowUps");

            migrationBuilder.AlterColumn<int>(
                name: "Status",
                table: "FollowUps",
                type: "integer",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");
        }
    }
}
