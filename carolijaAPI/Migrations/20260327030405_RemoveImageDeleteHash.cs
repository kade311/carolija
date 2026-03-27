using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace carolijaAPI.Migrations
{
    /// <inheritdoc />
    public partial class RemoveImageDeleteHash : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageDeleteHash",
                table: "ProductImages");

            migrationBuilder.DropColumn(
                name: "ImageDeleteHash",
                table: "Categories");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ImageDeleteHash",
                table: "ProductImages",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImageDeleteHash",
                table: "Categories",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
