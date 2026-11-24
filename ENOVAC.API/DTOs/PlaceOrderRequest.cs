namespace ENOVAC.API.DTOs;

public class PlaceOrderRequest
{
    public List<OrderItemRequest> OrderItems { get; set; } = new();
}

public class OrderItemRequest
{
    public int MenuItemId { get; set; }
    public int Quantity { get; set; }
}