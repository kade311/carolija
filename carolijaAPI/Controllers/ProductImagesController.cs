using carolijaAPI.Models;
using carolijaAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace carolijaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductImagesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ImgBBService _imgBBService;

        public ProductImagesController(AppDbContext context, ImgBBService imgBBService)
        {
            _context = context;
            _imgBBService = imgBBService;
        }

        [HttpGet("{productId}/images")]
        public async Task<IActionResult> GetImagesByProduct(int productId)
        {
            var productExists = await _context.Products.AnyAsync(p => p.ProductId == productId);
            if (!productExists)
            {
                return NotFound("Proizvod nije pronadjen");
            }

            var images = await _context.ProductImages
                .Where(pi => pi.ProductID == productId)
                .OrderByDescending(pi => pi.isMain)
                .Select(pi => new
                {
                    pi.ImageID,
                    pi.ImageUrl,
                    pi.isMain
                })
                .ToListAsync();

            return Ok(images);
        }

        [HttpPost("{productId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UploadImage(int productId, IFormFile image)
        {
            var productExists = await _context.Products.AnyAsync(p => p.ProductId == productId && p.Available && !p.Category.IsDeleted);
            if (!productExists)
            {
                return BadRequest(new { message = "Proizvod nije pronađen ili nije dostupan." });
            }

            var validationError = ImageValidation.Validate(image);
            if (validationError is not null)
            {
                return BadRequest(new { message = validationError });
            }

            var result = await _imgBBService.UploadImageAsync(image);
            if (result is null)
            {
                return BadRequest(new { message = "Upload slike nije uspio." });
            }

            var productImage = new ProductImage
            {
                ProductID = productId,
                ImageUrl = result.Url,
                isMain = false
            };

            _context.ProductImages.Add(productImage);
            await _context.SaveChangesAsync();

            return Ok(new { productImage.ImageID, productImage.ImageUrl, productImage.isMain });
        }

        [HttpPut("{id}/set-main")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateImage(int id)
        {
            var imageToSetMain = await _context.ProductImages.FirstOrDefaultAsync(pi => pi.ImageID == id);
            if (imageToSetMain == null)
            {
                return NotFound("Slika nije pronadjena");
            }

            var currentMain = await _context.ProductImages.FirstOrDefaultAsync(pi => pi.ProductID == imageToSetMain.ProductID && pi.isMain);
            if (currentMain != null)
            {
                currentMain.isMain = false;
            }

            imageToSetMain.isMain = true;
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpDelete("{id}/delete-image")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteImage(int id)
        {
            var image = await _context.ProductImages.FirstOrDefaultAsync(pi => pi.ImageID == id);
            if (image == null)
            {
                return NotFound();
            }

            _context.ProductImages.Remove(image);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
