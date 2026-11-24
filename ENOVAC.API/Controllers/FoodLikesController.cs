
using ENOVAC.API.Data;
using ENOVAC.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace ENOVAC.API.Controllers;

[Authorize(Roles = "Employee")]
[Route("api/[controller]")]
[ApiController]
public class FoodLikesController : ControllerBase
{
    private readonly EnovacDbContext _context;

    public FoodLikesController(EnovacDbContext context)
    {
        _context = context;
    }

    // Get logged-in employee ID from JWT
    private int GetLoggedInEmployeeId()
    {
        return int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value
        );
    }

    // 1. Like a food item
    [HttpPost("{menuItemId}")]
    public async Task<IActionResult> LikeFood(int menuItemId)
    {
        var employeeId = GetLoggedInEmployeeId();

        var menuItemExists = await _context.MenuItems
            .AnyAsync(m => m.MenuItemId == menuItemId);

        if (!menuItemExists)
            return NotFound("Menu item not found.");

        var alreadyLiked = await _context.FoodLikes
            .AnyAsync(f => f.EmployeeId == employeeId &&
                           f.MenuItemId == menuItemId);

        if (alreadyLiked)
            return BadRequest("Food item already liked.");

        var foodLike = new FoodLike
        {
            EmployeeId = employeeId,
            MenuItemId = menuItemId,
            CreatedAt = DateTime.UtcNow
        };

        _context.FoodLikes.Add(foodLike);
        await _context.SaveChangesAsync();

        return Ok("Food item liked successfully.");
    }

    // 2. Get liked food items of logged-in employee
    [HttpGet("my-likes")]
    public async Task<IActionResult> GetLikedFoods()
    {
        var employeeId = GetLoggedInEmployeeId();

        var likedFoods = await _context.FoodLikes
            .Where(f => f.EmployeeId == employeeId)
            .Include(f => f.MenuItem)
            .Select(f => new
            {
                f.FoodLikeId,
                f.MenuItemId,
                f.MenuItem!.FoodName,
                f.MenuItem.Price,
                f.CreatedAt
            })
            .ToListAsync();

        return Ok(likedFoods);
    }

    // 3. Unlike a food item
    [HttpDelete("{menuItemId}")]
    public async Task<IActionResult> UnlikeFood(int menuItemId)
    {
        var employeeId = GetLoggedInEmployeeId();

        Console.WriteLine($"Employee ID received: {employeeId}");
        Console.WriteLine($"Menu Item ID received: {menuItemId}");

        var foodLike = await _context.FoodLikes
            .FirstOrDefaultAsync(f =>
                f.EmployeeId == employeeId &&
                f.MenuItemId == menuItemId);

        Console.WriteLine($"Matching record found: {foodLike != null}");

        if (foodLike == null)
            return NotFound("Like not found.");

        _context.FoodLikes.Remove(foodLike);
        await _context.SaveChangesAsync();

        Console.WriteLine("Like deleted successfully.");

        return Ok("Food item unliked successfully.");
    }
}
