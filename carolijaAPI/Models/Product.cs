namespace carolijaAPI.Models

{
    public class Product
    {
        public int ProductId { get; set; }
        public int CategoryID { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string? ProductDescription { get; set; }
        public decimal ProductPrice { get; set; }
        public bool Available { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public Category Category { get; set; } = default!;
        public ICollection<ProductImage> ProductImages { get; set; } = new List<ProductImage>();
    }
}
