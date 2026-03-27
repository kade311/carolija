using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations.Schema;

namespace carolijaAPI.Models
{
    public class Cart
    {
        public int CartID { get; set; }
        public string UserID { get; set; } = string.Empty;

        [ForeignKey(nameof(UserID))]
        public IdentityUser User { get; set; } = default!;

        public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    }
}
