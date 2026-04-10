using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace CRM.API.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Leads",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Phone = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    Source = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Reason = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    ClinicId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Leads", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LookupValues",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    Category = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    DisplayName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LookupValues", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Packages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    DurationInDays = table.Column<int>(type: "integer", nullable: false),
                    Cost = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    ClinicId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Packages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "FollowUps",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    LeadId = table.Column<Guid>(type: "uuid", nullable: false),
                    FollowUpDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FollowUps", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FollowUps_Leads_LeadId",
                        column: x => x.LeadId,
                        principalTable: "Leads",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Enrollments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    LeadId = table.Column<Guid>(type: "uuid", nullable: false),
                    PackageId = table.Column<Guid>(type: "uuid", nullable: false),
                    PackageCostSnapshot = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    PackageDurationSnapshot = table.Column<int>(type: "integer", nullable: false),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    ClinicId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Enrollments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Enrollments_Leads_LeadId",
                        column: x => x.LeadId,
                        principalTable: "Leads",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Enrollments_Packages_PackageId",
                        column: x => x.PackageId,
                        principalTable: "Packages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RejoinRecords",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    LeadId = table.Column<Guid>(type: "uuid", nullable: false),
                    PackageId = table.Column<Guid>(type: "uuid", nullable: false),
                    PackageCostSnapshot = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    PackageDurationSnapshot = table.Column<int>(type: "integer", nullable: false),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RejoinRecords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RejoinRecords_Leads_LeadId",
                        column: x => x.LeadId,
                        principalTable: "Leads",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RejoinRecords_Packages_PackageId",
                        column: x => x.PackageId,
                        principalTable: "Packages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Bills",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    EnrollmentId = table.Column<Guid>(type: "uuid", nullable: true),
                    RejoinRecordId = table.Column<Guid>(type: "uuid", nullable: true),
                    PackageAmount = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    AdvanceAmount = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    PendingAmount = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    MedicineBillingAmount = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bills", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Bills_Enrollments_EnrollmentId",
                        column: x => x.EnrollmentId,
                        principalTable: "Enrollments",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Bills_RejoinRecords_RejoinRecordId",
                        column: x => x.RejoinRecordId,
                        principalTable: "RejoinRecords",
                        principalColumn: "Id");
                });

            migrationBuilder.InsertData(
                table: "LookupValues",
                columns: new[] { "Id", "Category", "Code", "CreatedAt", "DisplayName", "IsActive" },
                values: new object[,]
                {
                    { new Guid("a1000000-0000-0000-0000-000000000001"), "LeadSource", "WalkIn", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Walk-In", true },
                    { new Guid("a1000000-0000-0000-0000-000000000002"), "LeadSource", "Referral", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Referral", true },
                    { new Guid("a1000000-0000-0000-0000-000000000003"), "LeadSource", "SocialMedia", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Social Media", true },
                    { new Guid("a1000000-0000-0000-0000-000000000004"), "LeadSource", "Website", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Website", true },
                    { new Guid("a1000000-0000-0000-0000-000000000005"), "LeadReason", "BackPain", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Back Pain", true },
                    { new Guid("a1000000-0000-0000-0000-000000000006"), "LeadReason", "Stress", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Stress", true },
                    { new Guid("a1000000-0000-0000-0000-000000000007"), "LeadReason", "Detox", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Detox", true },
                    { new Guid("a1000000-0000-0000-0000-000000000008"), "LeadReason", "WeightLoss", new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Weight Loss", true }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Bills_EnrollmentId",
                table: "Bills",
                column: "EnrollmentId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Bills_RejoinRecordId",
                table: "Bills",
                column: "RejoinRecordId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Enrollments_LeadId",
                table: "Enrollments",
                column: "LeadId");

            migrationBuilder.CreateIndex(
                name: "IX_Enrollments_PackageId",
                table: "Enrollments",
                column: "PackageId");

            migrationBuilder.CreateIndex(
                name: "IX_FollowUps_LeadId",
                table: "FollowUps",
                column: "LeadId");

            migrationBuilder.CreateIndex(
                name: "IX_Leads_Phone",
                table: "Leads",
                column: "Phone",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LookupValues_Category_Code",
                table: "LookupValues",
                columns: new[] { "Category", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RejoinRecords_LeadId",
                table: "RejoinRecords",
                column: "LeadId");

            migrationBuilder.CreateIndex(
                name: "IX_RejoinRecords_PackageId",
                table: "RejoinRecords",
                column: "PackageId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Bills");

            migrationBuilder.DropTable(
                name: "FollowUps");

            migrationBuilder.DropTable(
                name: "LookupValues");

            migrationBuilder.DropTable(
                name: "Enrollments");

            migrationBuilder.DropTable(
                name: "RejoinRecords");

            migrationBuilder.DropTable(
                name: "Leads");

            migrationBuilder.DropTable(
                name: "Packages");
        }
    }
}
