using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GreenSolution.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddFarmOwnerRoleAndRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "OwnerId",
                table: "Farms",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Farms_OwnerId",
                table: "Farms",
                column: "OwnerId",
                unique: true,
                filter: "[OwnerId] IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_Farms_Users_OwnerId",
                table: "Farms",
                column: "OwnerId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Farms_Users_OwnerId",
                table: "Farms");

            migrationBuilder.DropIndex(
                name: "IX_Farms_OwnerId",
                table: "Farms");

            migrationBuilder.DropColumn(
                name: "OwnerId",
                table: "Farms");
        }
    }
}
