using carolijaAPI.Models;
using carolijaAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace carolijaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ImgBBService _imgBBService;

        public CategoriesController(AppDbContext context, ImgBBService imgBBService)
        {
            _context = context;
            _imgBBService = imgBBService;
        }

        [HttpGet]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _context.Categories
                .Where(c => !c.IsDeleted)
                .Select(c => new CategoryDto
                {
                    CategoryID = c.CategoryID,
                    CategoryName = c.CategoryName,
                    CategoryDescription = c.CategoryDescription,
                    ImageUrl = c.ImageUrl,
                    IsDeleted = c.IsDeleted
                })
                .ToListAsync();

            return Ok(categories);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCategory(int id)
        {
            var category = await _context.Categories
                .Where(c => c.CategoryID == id && !c.IsDeleted)
                .Select(c => new CategoryDto
                {
                    CategoryID = c.CategoryID,
                    CategoryName = c.CategoryName,
                    CategoryDescription = c.CategoryDescription,
                    ImageUrl = c.ImageUrl,
                    IsDeleted = c.IsDeleted
                })
                .FirstOrDefaultAsync();

            if (category == null)
            {
                return NotFound();
            }

            return Ok(category);
        }

        [HttpGet("admin/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetCategoryAdmin(int id)
        {
            var category = await _context.Categories
                .Select(c => new CategoryDto
                {
                    CategoryID = c.CategoryID,
                    CategoryName = c.CategoryName,
                    CategoryDescription = c.CategoryDescription,
                    ImageUrl = c.ImageUrl,
                    IsDeleted = c.IsDeleted
                })
                .FirstOrDefaultAsync(c => c.CategoryID == id);

            if (category == null)
            {
                return NotFound();
            }

            return Ok(category);
        }

        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetCategoriesWithDeleted()
        {
            var categories = await _context.Categories
                .Select(c => new
                {
                    c.CategoryID,
                    c.CategoryName,
                    c.CategoryDescription,
                    c.ImageUrl,
                    c.IsDeleted
                })
                .ToListAsync();

            return Ok(categories);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateCategory([FromForm] CategoryRequest request, [FromForm] IFormFile? image)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            if (image is not null)
            {
                var validationError = ImageValidation.Validate(image);
                if (validationError is not null)
                {
                    return BadRequest(new { message = validationError });
                }
            }

            string? url = null;
            if (image is not null)
            {
                var result = await _imgBBService.UploadImageAsync(image);
                if (result is null) return BadRequest(new { message = "Upload slike kategorije nije uspio." });
                url = result.Url;
            }

            var category = new Category
            {
                CategoryName = request.Name.Trim(),
                CategoryDescription = request.Description?.Trim(),
                ImageUrl = url
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();
            return Created();
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateCategory(int id, [FromForm] CategoryRequest request, [FromForm] IFormFile? image)
        {
            if (!ModelState.IsValid)
            {
                return ValidationProblem(ModelState);
            }

            var category = await _context.Categories.FindAsync(id);
            if (category == null)
            {
                return NotFound();
            }

            if (image is not null)
            {
                var validationError = ImageValidation.Validate(image);
                if (validationError is not null)
                {
                    return BadRequest(new { message = validationError });
                }
            }

            category.CategoryName = request.Name.Trim();
            category.CategoryDescription = request.Description?.Trim();

            if (image is not null && image.Length > 0)
            {
                var result = await _imgBBService.UploadImageAsync(image);
                if (result is null) return BadRequest(new { message = "Upload slike kategorije nije uspio." });
                category.ImageUrl = result.Url;
            }

            _context.Entry(category).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return Ok(category);
        }

        [HttpPut("restore/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RestoreCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
            {
                return NotFound();
            }

            category.IsDeleted = false;
            await _context.SaveChangesAsync();
            return Ok(category);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories
                .Include(c => c.Products)
                .FirstOrDefaultAsync(c => c.CategoryID == id);

            if (category == null)
            {
                return NotFound();
            }

            category.IsDeleted = true;
            foreach (var product in category.Products ?? [])
            {
                product.Available = false;
            }

            await _context.SaveChangesAsync();
            return Ok(category);
        }

        [HttpDelete("{id}/permanent")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PermanentlyDeleteCategory(int id)
        {
            var category = await _context.Categories
                .Include(item => item.Products)
                .FirstOrDefaultAsync(item => item.CategoryID == id);
            if (category is null) return NotFound();

            var productIds = category.Products?.Select(product => product.ProductId).ToList() ?? [];
            var hasOrders = await _context.OrderItems.AnyAsync(item => productIds.Contains(item.ProductID));
            if (hasOrders)
            {
                return Conflict(new { message = "Kategorija se ne može trajno obrisati jer njeni proizvodi postoje u narudžbama." });
            }

            _context.CartItems.RemoveRange(_context.CartItems.Where(item => productIds.Contains(item.ProductID)));
            _context.Favorites.RemoveRange(_context.Favorites.Where(item => productIds.Contains(item.ProductID)));
            _context.ProductImages.RemoveRange(_context.ProductImages.Where(item => productIds.Contains(item.ProductID)));
            _context.Inventories.RemoveRange(_context.Inventories.Where(item => productIds.Contains(item.ProductID)));
            _context.Products.RemoveRange(category.Products ?? []);
            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
