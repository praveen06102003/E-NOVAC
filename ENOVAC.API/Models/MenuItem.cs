namespace ENOVAC.API.Models;

public class MenuItem
{
    public int MenuItemId { get; set; }

    public DateTime MenuDate { get; set; }

    public int MealTypeId { get; set; }
    public MealType? MealType { get; set; }

    public string FoodName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public string? ImageUrl { get; set; }

    public bool IsAvailable { get; set; } = true;
}