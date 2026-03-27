using System.ComponentModel.DataAnnotations.Schema;

namespace carolijaAPI.Models
{
    public class OrderItem
    {
        public int OrderItemID { get; set; }
        public int OrderID { get; set; }

        [ForeignKey(nameof(OrderID))]
        public Order Order { get; set; } = default!;

        public int ProductID { get; set; }

        [ForeignKey(nameof(ProductID))]
        public Product Product { get; set; } = default!;

        public int Quantity { get; set; }
        public decimal PriceAtPurchase { get; set; }
    }
}
