namespace ENOVAC.API.Models;

public class Order
{
    public int OrderId { get; set; }

    public int EmployeeId { get; set; }
    public Employee? Employee { get; set; }

    public DateTime OrderDate { get; set; } = DateTime.UtcNow;

    public decimal TotalAmount { get; set; }

    public string OrderStatus { get; set; } = "Received";
    public List<OrderItem> OrderItems { get; set; } = new();
    public bool IsCleared { get; set; } = false;
}