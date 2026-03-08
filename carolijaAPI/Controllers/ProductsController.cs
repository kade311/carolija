using carolijaAPI.Models;
using carolijaAPI.Services;
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
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts(
            [FromQuery] int? categoryId = null,
            [FromQuery] string? search = null,
            [FromQuery] decimal? minPrice = null,
            [FromQuery] decimal? maxPrice = null,
            [FromQuery] string? sortBy = null,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 20)
        {
            var query = _context.Products.Include(p => p.ProductImages).AsQueryable();
            
            if (categoryId.HasValue)
            {
                query = query.Where(p => p.CategoryID == categoryId);
            }
            
            if (!string.IsNullOrWhiteSpace(search))
            {
                var words = search.ToLower().Split(' ', StringSplitOptions.RemoveEmptyEntries);

                foreach (var word in words)
                {
                    query = query.Where(p => p.ProductName.ToLower().Contains(word.ToLower()));
                }
            }
            
            if (minPrice.HasValue) query = query.Where(p => p.ProductPrice >= minPrice);
            if (maxPrice.HasValue) query = query.Where(p => p.ProductPrice <= maxPrice);

            query = sortBy switch
            {
                "price_asc" => query.OrderBy(p => p.ProductPrice),
                "price_desc" => query.OrderByDescending(p => p.ProductPrice),
                "name_asc" => query.OrderBy(p => p.ProductName),
                "name_desc" => query.OrderByDescending(p => p.ProductName),
                _ => query.OrderByDescending(p => p.ProductId)
            };

            var products = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(products);
        }

        [HttpGet("category/{categoryId}")]
        public async Task<ActionResult<IEnumerable<Product>>> GetProductsByCategoryId(int categoryId, [FromQuery] string? search = null, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20)
        {
            var query = _context.Products.Include(p=>p.ProductImages).Where(p=>p.CategoryID == categoryId).AsQueryable();

            //search
            if (!string.IsNullOrWhiteSpace(search))
            {
                var words = search.ToLower().Split(' ', StringSplitOptions.RemoveEmptyEntries);

                foreach (var word in words)
                {
                    query = query.Where(p=>p.ProductName.ToLower().Contains(word.ToLower()));
                }
            }

            //paginacija
            var products = await query
                .OrderBy(p=>p.ProductName)
                .Skip((pageNumber-1)*pageSize)
                .Take(pageSize)
                .ToListAsync();
            
            return Ok(products);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);

            if (product == null)
            {
                return NotFound();
            }
            return Ok(product);
        }

        [HttpGet("latest")]
        public async Task<IActionResult> GetLatestProducts([FromQuery] int arraySize = 15)
        {
            var products = await _context.Products
                .Include(p=>p.ProductImages)
                .OrderByDescending(p=> p.CreatedAt)
                .Take(arraySize)
                .ToListAsync();
            return Ok(products);
        }


        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateProduct([FromForm] string name, [FromForm] string description, [FromForm] int price, [FromForm] int categoryId)
        {
            var product = new Product
            {
                ProductName = name,
                ProductDescription = description,
                ProductPrice = price,
                CategoryID = categoryId,
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
        public async Task<IActionResult> UpdateProduct(int id, [FromForm] string name, [FromForm] string description, [FromForm] int price)
        {
            var product = await _context.Products.FindAsync(id);

            if (product == null) return NotFound();

            product.ProductName = name;
            product.ProductDescription = description;
            product.ProductPrice = price;

            await _context.SaveChangesAsync();
            return Ok(product);
        }

        [HttpPut("restore/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RestoreProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();
            product.Available = true;
            await _context.SaveChangesAsync();
            return Ok(product);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null) return NotFound();
            product.Available = false;
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
