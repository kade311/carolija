using carolijaAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace carolijaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<PagedResultDto<ProductDto>>> GetProducts(
            [FromQuery] int? categoryId = null,
            [FromQuery] string? search = null,
            [FromQuery] decimal? minPrice = null,
            [FromQuery] decimal? maxPrice = null,
            [FromQuery] string? sortBy = null,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20)
        {
            pageNumber = Math.Max(pageNumber, 1);
            pageSize = Math.Clamp(pageSize, 1, 50);

            var query = BuildPublicProductsQuery();
            query = ApplyProductFilters(query, categoryId, search, minPrice, maxPrice);
            query = ApplySorting(query, sortBy);

            var totalCount = await query.CountAsync();
            var entities = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new PagedResultDto<ProductDto>
            {
                Items = entities.Select(MapProductDto).ToList(),
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            });
        }

        [HttpGet("category/{categoryId}")]
        public async Task<ActionResult<PagedResultDto<ProductDto>>> GetProductsByCategoryId(
            int categoryId,
            [FromQuery] string? search = null,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20)
        {
            pageNumber = Math.Max(pageNumber, 1);
            pageSize = Math.Clamp(pageSize, 1, 50);

            var query = BuildPublicProductsQuery().Where(p => p.CategoryID == categoryId);
            if (!string.IsNullOrWhiteSpace(search))
            {
                var words = search.ToLower().Split(' ', StringSplitOptions.RemoveEmptyEntries);
                foreach (var word in words)
                {
                    query = query.Where(p => p.ProductName.ToLower().Contains(word));
                }
            }

            var totalCount = await query.CountAsync();
            var entities = await query
                .OrderBy(p => p.ProductName)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new PagedResultDto<ProductDto>
            {
                Items = entities.Select(MapProductDto).ToList(),
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            });
        }

        [HttpGet("admin/category/{categoryId}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<PagedResultDto<ProductDto>>> GetProductsByCategoryIdAdmin(
            int categoryId,
            [FromQuery] string? search = null,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20)
        {
            pageNumber = Math.Max(pageNumber, 1);
            pageSize = Math.Clamp(pageSize, 1, 50);

            var query = _context.Products
                .Include(p => p.Category)
                .Include(p => p.ProductImages)
                .Where(p => p.CategoryID == categoryId);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var words = search.ToLower().Split(' ', StringSplitOptions.RemoveEmptyEntries);
                foreach (var word in words)
                {
                    query = query.Where(p => p.ProductName.ToLower().Contains(word));
                }
            }

            var totalCount = await query.CountAsync();
            var entities = await query
                .OrderBy(p => p.ProductName)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new PagedResultDto<ProductDto>
            {
                Items = entities.Select(MapProductDto).ToList(),
                TotalCount = totalCount,
                PageNumber = pageNumber,
                PageSize = pageSize
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProduct(int id)
        {
            var entity = await BuildPublicProductsQuery()
                .FirstOrDefaultAsync(p => p.ProductId == id);

            if (entity == null)
            {
                return NotFound();
            }

            return Ok(MapProductDto(entity));
        }

        [HttpGet("latest")]
        public async Task<IActionResult> GetLatestProducts([FromQuery] int arraySize = 15)
        {
            arraySize = Math.Clamp(arraySize, 1, 50);

            var entities = await BuildPublicProductsQuery()
                .OrderByDescending(p => p.CreatedAt)
                .Take(arraySize)
                .ToListAsync();

            return Ok(entities.Select(MapProductDto).ToList());
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateProduct([FromForm] ProductRequest request)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var categoryExists = await _context.Categories.AnyAsync(c => c.CategoryID == request.CategoryId && !c.IsDeleted);
            if (!categoryExists)
            {
                return BadRequest(new { message = "Odabrana kategorija ne postoji ili je obrisana." });
            }

            var product = new Product
            {
                ProductName = request.Name.Trim(),
                ProductDescription = request.Description?.Trim(),
                ProductPrice = request.Price,
                CategoryID = request.CategoryId,
                CreatedAt = DateTime.UtcNow,
                Available = true,
                ProductImages = new List<ProductImage>()
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return Ok(product);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateProduct(int id, [FromForm] UpdateProductRequest request)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound();
            }

            product.ProductName = request.Name.Trim();
            product.ProductDescription = request.Description?.Trim();
            product.ProductPrice = request.Price;

            await _context.SaveChangesAsync();
            return Ok(product);
        }

        [HttpPut("restore/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RestoreProduct(int id)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.ProductId == id);

            if (product == null)
            {
                return NotFound();
            }

            if (product.Category.IsDeleted)
            {
                return BadRequest(new { message = "Proizvod se ne moze vratiti dok je kategorija obrisana." });
            }

            product.Available = true;
            await _context.SaveChangesAsync();
            return Ok(product);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound();
            }

            product.Available = false;
            await _context.SaveChangesAsync();
            return Ok();
        }

        private IQueryable<Product> BuildPublicProductsQuery()
        {
            return _context.Products
                .Include(p => p.Category)
                .Include(p => p.ProductImages)
                .Where(p => p.Available && !p.Category.IsDeleted);
        }

        private static IQueryable<Product> ApplyProductFilters(
            IQueryable<Product> query,
            int? categoryId,
            string? search,
            decimal? minPrice,
            decimal? maxPrice)
        {
            if (categoryId.HasValue)
            {
                query = query.Where(p => p.CategoryID == categoryId.Value);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var words = search.ToLower().Split(' ', StringSplitOptions.RemoveEmptyEntries);
                foreach (var word in words)
                {
                    query = query.Where(p => p.ProductName.ToLower().Contains(word));
                }
            }

            if (minPrice.HasValue)
            {
                query = query.Where(p => p.ProductPrice >= minPrice.Value);
            }

            if (maxPrice.HasValue)
            {
                query = query.Where(p => p.ProductPrice <= maxPrice.Value);
            }

            return query;
        }

        private static IQueryable<Product> ApplySorting(IQueryable<Product> query, string? sortBy)
        {
            return sortBy switch
            {
                "price_asc" => query.OrderBy(p => p.ProductPrice),
                "price_desc" => query.OrderByDescending(p => p.ProductPrice),
                "name_asc" => query.OrderBy(p => p.ProductName),
                "name_desc" => query.OrderByDescending(p => p.ProductName),
                _ => query.OrderByDescending(p => p.ProductId)
            };
        }

        private static ProductDto MapProductDto(Product p)
        {
            return new ProductDto
            {
                ProductId = p.ProductId,
                CategoryID = p.CategoryID,
                ProductName = p.ProductName,
                ProductDescription = p.ProductDescription,
                ProductPrice = p.ProductPrice,
                Available = p.Available,
                CreatedAt = p.CreatedAt,
                ProductImages = p.ProductImages
                    .OrderByDescending(img => img.isMain)
                    .Select(img => new ProductImageDto
                    {
                        ImageID = img.ImageID,
                        ImageUrl = img.ImageUrl,
                        IsMain = img.isMain
                    })
                    .ToList()
            };
        }
    }
}
