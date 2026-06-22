using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GreenSolution.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddIsActiveToMealPlan : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "MealPlans",
                type: "bit",
                nullable: false,
                defaultValue: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "MealPlans");
        }
    }
}
