using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ENOVAC.API.Migrations
{
    /// <inheritdoc />
    public partial class AddOrderClearStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsCleared",
                table: "Orders",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsCleared",
                table: "Orders");
        }
    }
}
