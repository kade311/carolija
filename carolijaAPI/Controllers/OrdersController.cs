using carolijaAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace carolijaAPI.Controllers;

[ApiController]
[Authorize]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _context;
    public OrdersController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetMine()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var orders = await _context.Orders.Include(o => o.OrderItems).ThenInclude(i => i.Product)
            .Where(o => o.UserID == userId).OrderByDescending(o => o.OrderDate).ToListAsync();
        return Ok(orders.Select(o => new
        {
            orderId = o.OrderID, orderDate = o.OrderDate, totalAmount = o.TotalAmount, status = o.Status,
            items = o.OrderItems.Select(i => new { productName = i.Product.ProductName, quantity = i.Quantity, price = i.PriceAtPurchase })
        }));
    }

    [HttpPost]
    public async Task<IActionResult> Create(CheckoutRequest request)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var cart = await _context.Carts.Include(c => c.CartItems).ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(c => c.UserID == userId);
        if (cart is null || cart.CartItems.Count == 0) return BadRequest(new { message = "Košarica je prazna." });
        if (cart.CartItems.Any(i => !i.Product.Available)) return BadRequest(new { message = "Jedan od proizvoda više nije dostupan." });

        var order = new Order
        {
            UserID = userId,
            Status = "Pending",
            CustomerName = request.CustomerName.Trim(),
            Address = request.Address.Trim(),
            Phone = request.Phone.Trim()
        };
        foreach (var item in cart.CartItems)
        {
            order.OrderItems.Add(new OrderItem { ProductID = item.ProductID, Quantity = item.Quantity, PriceAtPurchase = item.Product.ProductPrice });
        }
        order.TotalAmount = order.OrderItems.Sum(i => i.Quantity * i.PriceAtPurchase);
        _context.Orders.Add(order);
        _context.CartItems.RemoveRange(cart.CartItems);
        await _context.SaveChangesAsync();
        return Ok(new { orderId = order.OrderID, totalAmount = order.TotalAmount });
    }
}
