
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
public class PaymentsController : ControllerBase
{
    private readonly EnovacDbContext _context;

    public PaymentsController(EnovacDbContext context)
    {
        _context = context;
    }

    private int GetLoggedInEmployeeId()
    {
        return int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value
        );
    }

    // 1. Create simulated payment for own order
    [HttpPost]
    public async Task<IActionResult> CreatePayment(
        [FromBody] CreatePaymentRequest request)
    {
        var employeeId = GetLoggedInEmployeeId();

        var order = await _context.Orders
            .FirstOrDefaultAsync(o =>
                o.OrderId == request.OrderId &&
                o.EmployeeId == employeeId);

        if (order == null)
            return NotFound("Order not found.");

        if (order.IsCleared)
            return BadRequest("Payment cannot be made for a cleared order.");

        var alreadyPaid = await _context.Payments.AnyAsync(
            p => p.OrderId == request.OrderId &&
                 p.PaymentStatus == "Success");

        if (alreadyPaid)
            return BadRequest("Payment already completed.");

        var payment = new Payment
        {
            OrderId = order.OrderId,
            Amount = order.TotalAmount,
            PaymentStatus = "Success",
            PaymentMethod = "Test",
            CreatedAt = DateTime.UtcNow
        };

        _context.Payments.Add(payment);
        await _context.SaveChangesAsync();

        return Ok(payment);
    }

    // 2. Get all payments - Provider only
    [Authorize(Roles = "Provider")]
    [HttpGet]
    public async Task<IActionResult> GetAllPayments()
    {
        var payments = await _context.Payments
            .Include(p => p.Order)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        return Ok(payments);
    }

    // 3. Get payment for own order
    [HttpGet("order/{orderId}")]
    public async Task<IActionResult> GetPaymentByOrder(int orderId)
    {
        var employeeId = GetLoggedInEmployeeId();

        var orderExists = await _context.Orders
            .AnyAsync(o =>
                o.OrderId == orderId &&
                o.EmployeeId == employeeId);

        if (!orderExists)
            return NotFound("Order not found.");

        var payment = await _context.Payments
            .FirstOrDefaultAsync(p => p.OrderId == orderId);

        if (payment == null)
            return NotFound("Payment not found.");

        return Ok(payment);
    }
}

// Request DTO
public class CreatePaymentRequest
{
    public int OrderId { get; set; }
}
