namespace ENOVAC.API.Models;

public class Payment
{
    public int PaymentId { get; set; }

    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public decimal Amount { get; set; }

    public string PaymentStatus { get; set; } = "Pending";

    public string PaymentMethod { get; set; } = "Test";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}