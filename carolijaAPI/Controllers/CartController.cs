using carolijaAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace carolijaAPI.Controllers;

[ApiController]
[Authorize]
[Route("api/cart")]
public class CartController : ControllerBase
{
    private readonly AppDbContext _context;

    public CartController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        var cart = await GetOrCreateCart();
        return Ok(await MapCart(cart.CartID));
    }

    [HttpPost("items")]
    public async Task<IActionResult> AddItem(CartItemRequest request)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var product = await _context.Products.FirstOrDefaultAsync(p => p.ProductId == request.ProductId && p.Available && !p.Category.IsDeleted);
        if (product is null) return NotFound(new { message = "Proizvod nije pronađen ili nije dostupan." });

        var cart = await GetOrCreateCart();
        var item = await _context.CartItems.FirstOrDefaultAsync(i => i.CartID == cart.CartID && i.ProductID == request.ProductId);
        if (item is null) _context.CartItems.Add(new CartItem { CartID = cart.CartID, ProductID = request.ProductId, Quantity = request.Quantity });
        else item.Quantity = Math.Min(item.Quantity + request.Quantity, 100);
        await _context.SaveChangesAsync();
        return Ok(await MapCart(cart.CartID));
    }

    [HttpPut("items/{productId}")]
    public async Task<IActionResult> UpdateItem(int productId, CartItemRequest request)
    {
        var cart = await GetOrCreateCart();
        var item = await _context.CartItems.FirstOrDefaultAsync(i => i.CartID == cart.CartID && i.ProductID == productId);
        if (item is null) return NotFound();
        item.Quantity = request.Quantity;
        await _context.SaveChangesAsync();
        return Ok(await MapCart(cart.CartID));
    }

    [HttpDelete("items/{productId}")]
    public async Task<IActionResult> RemoveItem(int productId)
    {
        var cart = await GetOrCreateCart();
        var item = await _context.CartItems.FirstOrDefaultAsync(i => i.CartID == cart.CartID && i.ProductID == productId);
        if (item is null) return NotFound();
        _context.CartItems.Remove(item);
        await _context.SaveChangesAsync();
        return Ok(await MapCart(cart.CartID));
    }

    private async Task<Cart> GetOrCreateCart()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var cart = await _context.Carts.FirstOrDefaultAsync(c => c.UserID == userId);
        if (cart is not null) return cart;
        cart = new Cart { UserID = userId };
        _context.Carts.Add(cart);
        await _context.SaveChangesAsync();
        return cart;
    }

    private async Task<object> MapCart(int cartId)
    {
        var items = await _context.CartItems.Include(i => i.Product).ThenInclude(p => p.ProductImages)
            .Where(i => i.CartID == cartId).ToListAsync();
        return new
        {
            items = items.Select(i => new { productId = i.ProductID, quantity = i.Quantity, product = new
            {
                productId = i.Product.ProductId, productName = i.Product.ProductName,
                productPrice = i.Product.ProductPrice, available = i.Product.Available,
                imageUrl = i.Product.ProductImages.OrderByDescending(x => x.isMain).Select(x => x.ImageUrl).FirstOrDefault()
            }}),
            total = items.Sum(i => i.Quantity * i.Product.ProductPrice)
        };
    }
}
