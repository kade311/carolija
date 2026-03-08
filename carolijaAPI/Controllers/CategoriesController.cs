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
            var categories = await _context.Categories.Where(c=> !c.IsDeleted).Select(c => new
            {
                c.CategoryID,
                c.CategoryName,
                c.CategoryDescription,
                c.ImageUrl,
                c.ImageDeleteHash
            }).ToListAsync();
            
            return Ok(categories);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCategory(int id)
        {
            var category = await _context.Categories.Where(c => c.CategoryID == id && !c.IsDeleted).Select(c => new
            {
                c.CategoryID,
                c.CategoryName,
                c.CategoryDescription,
                c.ImageUrl,
                c.ImageDeleteHash
            }).FirstOrDefaultAsync();

            if (category == null) return NotFound();
            return Ok(category);
        }

        [HttpGet("admin")]
        public async Task<IActionResult> GetCategoriesWithDeleted()
        {
            var categories = await _context.Categories.Select(c => new
            {
                c.CategoryID,
                c.CategoryName,
                c.CategoryDescription,
                c.ImageUrl,
                c.ImageDeleteHash,
                c.IsDeleted
            }).ToListAsync();

            return Ok(categories);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateCategory([FromForm] string name, [FromForm] string description, [FromForm] IFormFile? image)
        {

            string url = null;
            string hash = null;

            if (image != null)
            {
                var result = await _imgBBService.UploadImageAsync(image);
                url = result.Url;
                hash = result.DeleteHash;
            }

            var category = new Category
            {
                CategoryName = name,
                CategoryDescription = description,
                ImageUrl=url,
                ImageDeleteHash = hash
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();
            return Created();
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateCategory(int id, [FromForm] string name, [FromForm] string description, [FromForm] IFormFile? image)
        {

            var category = await _context.Categories.FindAsync(id);
            if (category == null) return NotFound();


            category.CategoryName = name;
            category.CategoryDescription = description;

            if(image!=null && image.Length > 0)
            {

                var (url, hash) = await _imgBBService.UploadImageAsync(image);

                if (url != null)
                {
                category.ImageUrl = url;
                category.ImageDeleteHash = hash;
                }
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
            if (category == null) return NotFound();
            category.IsDeleted = false;
            await _context.SaveChangesAsync();
            return Ok(category);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return NotFound();

            category.IsDeleted = true;

            await _context.SaveChangesAsync();
            return Ok(category);
        }
    }
}
