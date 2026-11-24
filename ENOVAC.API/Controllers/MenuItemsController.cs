
using ENOVAC.API.Data;
using ENOVAC.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

namespace ENOVAC.API.Controllers;

[Authorize]
[Route("api/[controller]")]
[ApiController]
public class MenuItemsController : ControllerBase
{
    private readonly EnovacDbContext _context;

    public MenuItemsController(EnovacDbContext context)
    {
        _context = context;
    }

    // 1. Get today's menu - Employee and Provider
    [HttpGet("today")]
    public async Task<IActionResult> GetTodayMenu()
    {
        var today = DateTime.Today;

        var menu = await _context.MenuItems
            .Include(m => m.MealType)
            .Where(m => m.MenuDate.Date == today && m.IsAvailable)
            .ToListAsync();

        return Ok(menu);
    }

    // 2. Get yesterday's menu - Employee and Provider
    [HttpGet("yesterday")]
    public async Task<IActionResult> GetYesterdayMenu()
    {
        var yesterday = DateTime.Today.AddDays(-1);

        var menu = await _context.MenuItems
            .Include(m => m.MealType)
            .Where(m => m.MenuDate.Date == yesterday)
            .ToListAsync();

        return Ok(menu);
    }

    // 3. Filter menu by category - Employee and Provider
    [HttpGet("category/{mealTypeId}")]
    public async Task<IActionResult> GetMenuByCategory(int mealTypeId)
    {
        var menu = await _context.MenuItems
            .Include(m => m.MealType)
            .Where(m => m.MealTypeId == mealTypeId
                     && m.MenuDate.Date == DateTime.Today
                     && m.IsAvailable)
            .ToListAsync();

        return Ok(menu);
    }

    // 4. Add menu item - Provider only
    [Authorize(Roles = "Provider")]
    [HttpPost]
    public async Task<IActionResult> AddMenuItem(MenuItem menuItem)
    {
        _context.MenuItems.Add(menuItem);
        await _context.SaveChangesAsync();

        return Ok(menuItem);
    }

    // 5. Update menu item - Provider only
    [Authorize(Roles = "Provider")]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateMenuItem(
        int id, MenuItem updatedItem)
    {
        var menuItem = await _context.MenuItems.FindAsync(id);

        if (menuItem == null)
            return NotFound("Menu item not found.");

        menuItem.MenuDate = updatedItem.MenuDate;
        menuItem.MealTypeId = updatedItem.MealTypeId;
        menuItem.FoodName = updatedItem.FoodName;
        menuItem.Description = updatedItem.Description;
        menuItem.Price = updatedItem.Price;
        menuItem.ImageUrl = updatedItem.ImageUrl;
        menuItem.IsAvailable = updatedItem.IsAvailable;

        await _context.SaveChangesAsync();

        return Ok(menuItem);
    }

    // 6. Delete menu item - Provider only
    [Authorize(Roles = "Provider")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMenuItem(int id)
    {
        var menuItem = await _context.MenuItems.FindAsync(id);

        if (menuItem == null)
            return NotFound("Menu item not found.");

        _context.MenuItems.Remove(menuItem);
        await _context.SaveChangesAsync();

        return Ok("Menu item deleted successfully.");
    }
}
