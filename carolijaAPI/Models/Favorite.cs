using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations.Schema;

namespace carolijaAPI.Models
{
    public class Favorite
    {
        public int FavoriteID { get; set; }
        public string UserID { get; set; } = string.Empty;

        [ForeignKey(nameof(UserID))]
        public IdentityUser User { get; set; } = default!;

        public int ProductID { get; set; }

        [ForeignKey(nameof(ProductID))]
        public Product Product { get; set; } = default!;
    }
}
