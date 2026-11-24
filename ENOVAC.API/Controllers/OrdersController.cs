
using ENOVAC.API.Data;
using ENOVAC.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using ENOVAC.API.DTOs;
namespace ENOVAC.API.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class OrdersController : ControllerBase
{
    private readonly EnovacDbContext _context; 

    public OrdersController(EnovacDbContext context)
    {
        _context = context;
    }

    private int GetLoggedInEmployeeId()
    {
        return int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value
        );
    }

    // 1. Place order - Employee only
    [Authorize(Roles = "Employee")]
    [HttpPost]
    public async Task<IActionResult> PlaceOrder(
        [FromBody] PlaceOrderRequest request)
    {
        if (request.OrderItems == null || !request.OrderItems.Any())
            return BadRequest("An order must contain at least one item.");

        var menuItemIds = request.OrderItems
            .Select(i => i.MenuItemId)
            .ToList();

        if (menuItemIds.Distinct().Count() != menuItemIds.Count)
            return BadRequest("Duplicate menu items are not allowed.");

        foreach (var item in request.OrderItems)
        {
            if (item.Quantity <= 0 || item.Quantity > 50)
                return BadRequest("Quantity must be between 1 and 50.");
        }

        var menuItems = await _context.MenuItems
            .Where(m => menuItemIds.Contains(m.MenuItemId)
                     && m.MenuDate.Date == DateTime.Today
                     && m.IsAvailable)
            .ToDictionaryAsync(m => m.MenuItemId);

        if (menuItems.Count != menuItemIds.Count)
            return BadRequest("One or more menu items are unavailable.");

        var order = new Order
        {
            EmployeeId = GetLoggedInEmployeeId(),
            OrderDate = DateTime.UtcNow,
            OrderStatus = "Received",
            IsCleared = false
        };

        foreach (var item in request.OrderItems)
        {
            var menuItem = menuItems[item.MenuItemId];

            order.OrderItems.Add(new OrderItem
            {
                MenuItemId = item.MenuItemId,
                Quantity = item.Quantity,
                UnitPrice = menuItem.Price
            });
        }

        order.TotalAmount = order.OrderItems.Sum(
            item => item.UnitPrice * item.Quantity);

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        return Ok(order);
    }

    // 2. Get all orders - Provider only
    [Authorize(Roles = "Provider")]
    [HttpGet]
    public async Task<IActionResult> GetAllOrders()
    {
        var orders = await _context.Orders
            .Include(o => o.Employee)
            .Include(o => o.OrderItems)
                .ThenInclude(i => i.MenuItem)
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync();

        return Ok(orders);
    }

    // 3. Get employee's own orders
    [Authorize(Roles = "Employee")]
    [HttpGet("employee/{employeeId}")]
    public async Task<IActionResult> GetOrdersByEmployee(int employeeId)
    {
        var loggedInEmployeeId = GetLoggedInEmployeeId();

        if (employeeId != loggedInEmployeeId)
            return Forbid();

        var orders = await _context.Orders
            .Include(o => o.OrderItems)
                .ThenInclude(i => i.MenuItem)
            .Where(o => o.EmployeeId == loggedInEmployeeId)
            .OrderByDescending(o => o.OrderDate)
            .ToListAsync();

        return Ok(orders);
    }

    // 4. Get order details
    [Authorize(Roles = "Employee")]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrderById(int id)
    {
        var order = await _context.Orders
            .Include(o => o.Employee)
            .Include(o => o.OrderItems)
                .ThenInclude(i => i.MenuItem)
            .FirstOrDefaultAsync(o => o.OrderId == id);

        if (order == null)
            return NotFound("Order not found.");

        if (order.EmployeeId != GetLoggedInEmployeeId())
            return Forbid();

        return Ok(order);
    }

    // 5. Update order status - Provider only
    [Authorize(Roles = "Provider")]
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateOrderStatus(
        int id,
        [FromBody] UpdateOrderStatusRequest request)
    {
        var order = await _context.Orders.FindAsync(id);

        if (order == null)
            return NotFound("Order not found.");

        if (order.IsCleared)
            return BadRequest("This order has already been cleared.");

        var validTransition =
            (order.OrderStatus == "Received" && request.Status == "Preparing") ||
            (order.OrderStatus == "Preparing" && request.Status == "Ready") ||
            (order.OrderStatus == "Ready" && request.Status == "Collected");

        if (!validTransition)
            return BadRequest("Invalid order status transition.");

        order.OrderStatus = request.Status;

        await _context.SaveChangesAsync();

        return Ok(order);
    }

    // 6. Get active orders - Provider only
    [Authorize(Roles = "Provider")]
    [HttpGet("provider/active")]
    public async Task<IActionResult> GetActiveOrders()
    {
        var orders = await _context.Orders
            .Include(o => o.Employee)
            .Include(o => o.OrderItems)
                .ThenInclude(i => i.MenuItem)
            .Where(o => !o.IsCleared)
            .OrderBy(o => o.OrderDate)
            .ToListAsync();

        return Ok(orders);
    }

    // 7. Clear collected order - Provider only
    [Authorize(Roles = "Provider")]
    [HttpPut("{id}/clear")]
    public async Task<IActionResult> ClearOrder(int id)
    {
        var order = await _context.Orders.FindAsync(id);

        if (order == null)
            return NotFound("Order not found.");

        if (order.OrderStatus != "Collected")
            return BadRequest("Only collected orders can be cleared.");

        if (order.IsCleared)
            return BadRequest("Order is already cleared.");

        order.IsCleared = true;

        await _context.SaveChangesAsync();

        return Ok("Order cleared successfully.");
    }
}
