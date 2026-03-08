using System.ComponentModel.DataAnnotations;

namespace carolijaAPI.Models
{
    public class ProductImage
    {
        [Key] public int ImageID { get; set; }
        public int ProductID { get; set; }
        public string? ImageUrl { get; set; }
        public string? ImageDeleteHash { get; set; }
        public bool isMain { get; set; } = false;
        public Product? Product { get; set; }

    }
}
