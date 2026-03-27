using System.ComponentModel.DataAnnotations;

namespace carolijaAPI.Models
{
    public class CategoryRequest
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Description { get; set; }
    }

    public class ProductRequest
    {
        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string? Description { get; set; }

        [Range(typeof(decimal), "0.01", "9999999")]
        public decimal Price { get; set; }

        [Range(1, int.MaxValue)]
        public int CategoryId { get; set; }
    }

    public class UpdateProductRequest
    {
        [Required]
        [MaxLength(150)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(2000)]
        public string? Description { get; set; }

        [Range(typeof(decimal), "0.01", "9999999")]
        public decimal Price { get; set; }
    }

    public class CategoryDto
    {
        public int CategoryID { get; set; }
        public string? CategoryName { get; set; }
        public string? CategoryDescription { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsDeleted { get; set; }
    }

    public class ProductImageDto
    {
        public int ImageID { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsMain { get; set; }
    }

    public class ProductDto
    {
        public int ProductId { get; set; }
        public int CategoryID { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string? ProductDescription { get; set; }
        public decimal ProductPrice { get; set; }
        public bool Available { get; set; }
        public DateTime CreatedAt { get; set; }
        public ICollection<ProductImageDto> ProductImages { get; set; } = new List<ProductImageDto>();
    }

    public class PagedResultDto<T>
    {
        public ICollection<T> Items { get; set; } = new List<T>();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
    }

    public class ImgBbUploadResult
    {
        public string Url { get; set; } = string.Empty;
    }
}
