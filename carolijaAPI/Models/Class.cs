using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations.Schema;

namespace carolijaAPI.Models
{
    public class Favorite
    {
        public int FavoriteID { get; set; }

        public string UserID { get; set; }
        [ForeignKey(nameof(UserID))]
        public IdentityUser User { get; set; }

        public int ProductID { get; set; }
        [ForeignKey(nameof(ProductID))]
        public Product Product { get; set; }
    }

    public class Cart
    {
        public int CartID { get; set; }
        public string UserID { get; set; }

        [ForeignKey(nameof(UserID))]
        public IdentityUser User { get; set; }

        public ICollection<CartItem> CartItems { get; set; }
    }

    public class CartItem
    {
        public int CartItemID { get; set; }
        public int CartID { get; set; }
        public int ProductID { get; set; }
        public int Quantity { get; set; }

        [ForeignKey(nameof(CartID))]
        public Cart Cart { get; set; }

        [ForeignKey(nameof(ProductID))]
        public Product Product { get; set; }
    }

    public class Order
    {
        public int OrderID { get; set; }
        public string UserID { get; set; }

        [ForeignKey(nameof(UserID))]
        public IdentityUser User { get; set; }
        public DateTime OrderDate { get; set; } = DateTime.Now;
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = "Pending";
        public ICollection<OrderItem> OrderItems { get; set; }
    }

    public class OrderItem
    {
        public int OrderItemID { get; set; }

        public int OrderID { get; set; }
        [ForeignKey(nameof(OrderID))]
        public Order Order { get; set; }

        public int ProductID { get; set; }
        [ForeignKey(nameof(ProductID))]
        public Product Product { get; set; }
        public int Quantity { get; set; }
        public decimal PriceAtPurchase { get; set; }
    }

    public class Inventory
    {
        public int InventoryID { get; set; }

        public int ProductID { get; set; }
        [ForeignKey(nameof(ProductID))]
        public Product Product { get; set; }
        public int StockQuantity { get; set; }
        public DateTime LastUpdated { get; set; } = DateTime.Now;
    }
}
