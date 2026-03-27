using System.ComponentModel.DataAnnotations.Schema;

namespace carolijaAPI.Models
{
    public class Inventory
    {
        public int InventoryID { get; set; }
        public int ProductID { get; set; }

        [ForeignKey(nameof(ProductID))]
        public Product Product { get; set; } = default!;

        public int StockQuantity { get; set; }
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }
}
