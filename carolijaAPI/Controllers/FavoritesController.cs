using carolijaAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace carolijaAPI.Controllers;

[ApiController]
[Authorize]
[Route("api/favorites")]
public class FavoritesController : ControllerBase
{
    private readonly AppDbContext _context;
    public FavoritesController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var ids = await _context.Favorites.Where(f => f.UserID == userId).Select(f => f.ProductID).ToListAsync();
        return Ok(ids);
    }

    [HttpPost("{productId}")]
    public async Task<IActionResult> Toggle(int productId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var favorite = await _context.Favorites.FirstOrDefaultAsync(f => f.UserID == userId && f.ProductID == productId);
        if (favorite is null) _context.Favorites.Add(new Favorite { UserID = userId, ProductID = productId });
        else _context.Favorites.Remove(favorite);
        await _context.SaveChangesAsync();
        return Ok(new { isFavorite = favorite is null });
    }
}
