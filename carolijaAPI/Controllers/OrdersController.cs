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
    public async Task<IActionResult> GetMine(CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var orders = await _context.Orders.Include(o => o.OrderItems).ThenInclude(i => i.Product)
            .Where(o => o.UserID == userId).OrderByDescending(o => o.OrderDate).ToListAsync(cancellationToken);
        return Ok(orders.Select(o => new
        {
            orderId = o.OrderID, orderDate = o.OrderDate, totalAmount = o.TotalAmount, status = o.Status,
            customerName = o.CustomerName, address = o.Address, phone = o.Phone,
            items = o.OrderItems.Select(i => new { productName = i.Product.ProductName, quantity = i.Quantity, price = i.PriceAtPurchase })
        }));
    }

    [HttpPost]
    public async Task<IActionResult> Create(CheckoutRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        await using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
        var cart = await _context.Carts.Include(c => c.CartItems).ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(c => c.UserID == userId, cancellationToken);
        if (cart is null || cart.CartItems.Count == 0) return BadRequest(new { message = "Košarica je prazna." });
        if (cart.CartItems.Any(i => !i.Product.Available)) return BadRequest(new { message = "Jedan od proizvoda više nije dostupan." });

        var productIds = cart.CartItems.Select(item => item.ProductID).ToList();
        var inventories = await _context.Inventories
            .Where(inventory => productIds.Contains(inventory.ProductID))
            .ToDictionaryAsync(inventory => inventory.ProductID, cancellationToken);
        foreach (var item in cart.CartItems)
        {
            if (inventories.TryGetValue(item.ProductID, out var inventory) && inventory.StockQuantity < item.Quantity)
            {
                return BadRequest(new { message = $"Nema dovoljno zalihe za proizvod: {item.Product.ProductName}." });
            }
        }

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
            if (inventories.TryGetValue(item.ProductID, out var inventory))
            {
                inventory.StockQuantity -= item.Quantity;
                inventory.LastUpdated = DateTime.UtcNow;
            }
            order.OrderItems.Add(new OrderItem { ProductID = item.ProductID, Quantity = item.Quantity, PriceAtPurchase = item.Product.ProductPrice });
        }
        order.TotalAmount = order.OrderItems.Sum(i => i.Quantity * i.PriceAtPurchase);
        _context.Orders.Add(order);
        _context.CartItems.RemoveRange(cart.CartItems);
        await _context.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return Ok(new { orderId = order.OrderID, totalAmount = order.TotalAmount });
    }

    [HttpGet("admin")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? status = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Orders
            .Include(order => order.User)
            .Include(order => order.OrderItems)
            .ThenInclude(item => item.Product)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(order => order.Status == status);
        }

        var orders = await query.OrderByDescending(order => order.OrderDate).ToListAsync(cancellationToken);
        return Ok(orders.Select(order => new
        {
            orderId = order.OrderID,
            orderDate = order.OrderDate,
            status = order.Status,
            customerName = order.CustomerName,
            address = order.Address,
            phone = order.Phone,
            userEmail = order.User.Email,
            totalAmount = order.TotalAmount,
            items = order.OrderItems.Select(item => new
            {
                productName = item.Product.ProductName,
                quantity = item.Quantity,
                price = item.PriceAtPurchase
            })
        }));
    }

    [HttpPut("{id}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] OrderStatusRequest request, CancellationToken cancellationToken)
    {
        var validStatuses = new[] { "Pending", "Approved", "Shipped", "Canceled" };
        if (!validStatuses.Contains(request.Status))
        {
            return BadRequest(new { message = "Status narudžbe nije validan." });
        }

        var order = await _context.Orders.Include(item => item.OrderItems)
            .FirstOrDefaultAsync(item => item.OrderID == id, cancellationToken);
        if (order is null) return NotFound();
        if (order.Status == "Canceled" && request.Status != "Canceled")
        {
            return BadRequest(new { message = "Otkazana narudžba se ne može ponovo aktivirati." });
        }

        order.Status = request.Status;
        await _context.SaveChangesAsync(cancellationToken);
        return Ok(new { orderId = order.OrderID, status = order.Status });
    }

    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> Cancel(int id, CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var order = await _context.Orders.Include(item => item.OrderItems)
            .FirstOrDefaultAsync(item => item.OrderID == id && item.UserID == userId, cancellationToken);
        if (order is null) return NotFound();
        if (order.Status != "Pending")
        {
            return BadRequest(new { message = "Samo Pending narudžbe se mogu otkazati." });
        }

        var productIds = order.OrderItems.Select(item => item.ProductID).ToList();
        var inventories = await _context.Inventories.Where(item => productIds.Contains(item.ProductID))
            .ToDictionaryAsync(item => item.ProductID, cancellationToken);
        foreach (var item in order.OrderItems)
        {
            if (inventories.TryGetValue(item.ProductID, out var inventory))
            {
                inventory.StockQuantity += item.Quantity;
                inventory.LastUpdated = DateTime.UtcNow;
            }
        }
        order.Status = "Canceled";
        await _context.SaveChangesAsync(cancellationToken);
        return Ok(new { orderId = order.OrderID, status = order.Status });
    }

    [HttpGet("admin/summary")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetSummary(CancellationToken cancellationToken)
    {
        var revenue = await _context.Orders
            .Where(order => order.Status == "Approved" || order.Status == "Shipped")
            .SumAsync(order => (decimal?)order.TotalAmount, cancellationToken) ?? 0;
        var pending = await _context.Orders.CountAsync(order => order.Status == "Pending", cancellationToken);
        var criticalStock = await _context.Inventories.Include(inventory => inventory.Product)
            .Where(inventory => inventory.StockQuantity < 3)
            .OrderBy(inventory => inventory.StockQuantity)
            .Select(inventory => new
            {
                productId = inventory.ProductID,
                productName = inventory.Product.ProductName,
                stockQuantity = inventory.StockQuantity
            })
            .ToListAsync(cancellationToken);
        return Ok(new { revenue, pendingOrders = pending, criticalStock });
    }
}
