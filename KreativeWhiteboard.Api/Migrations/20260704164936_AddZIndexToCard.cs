using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace KreativeWhiteboard.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddZIndexToCard : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ZIndex",
                table: "Cards",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ZIndex",
                table: "Cards");
        }
    }
}
