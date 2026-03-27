using System.ComponentModel.DataAnnotations.Schema;

namespace carolijaAPI.Models
{
    public class CartItem
    {
        public int CartItemID { get; set; }
        public int CartID { get; set; }
        public int ProductID { get; set; }
        public int Quantity { get; set; }

        [ForeignKey(nameof(CartID))]
        public Cart Cart { get; set; } = default!;

        [ForeignKey(nameof(ProductID))]
        public Product Product { get; set; } = default!;
    }
}
