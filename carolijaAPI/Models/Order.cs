using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations.Schema;

namespace carolijaAPI.Models
{
    public class Order
    {
        public int OrderID { get; set; }
        public string UserID { get; set; } = string.Empty;

        [ForeignKey(nameof(UserID))]
        public IdentityUser User { get; set; } = default!;

        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = "Pending";
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}
