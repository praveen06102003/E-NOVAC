namespace ENOVAC.API.Models;

public class FoodLike
{
    public int FoodLikeId { get; set; }

    public int EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;

    public int MenuItemId { get; set; }
    public MenuItem MenuItem { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}