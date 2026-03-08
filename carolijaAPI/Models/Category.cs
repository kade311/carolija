namespace carolijaAPI.Models
{
    public class Category
    {
        public int CategoryID { get; set; }
        public string? CategoryName { get; set; }
        public string? CategoryDescription { get; set; }
        public string? ImageUrl { get; set; }
        public string? ImageDeleteHash { get; set; }
        public bool IsDeleted { get; set; } = false;
        public ICollection<Product>? Products { get; set; }
    }
}
