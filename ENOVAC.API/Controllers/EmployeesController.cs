using ENOVAC.API.Data;
using ENOVAC.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ENOVAC.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class EmployeesController : ControllerBase
{
    private readonly EnovacDbContext _context;

    public EmployeesController(EnovacDbContext context)
    {
        _context = context;
    }
    [HttpPost("register")]
    public async Task<IActionResult> RegisterEmployee(Employee employee)
    {
        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();

        return Ok(employee);
    }
    [HttpGet("mobile/{mobileNumber}")]
    public async Task<IActionResult> GetEmployeeByMobile(string mobileNumber)
    {
        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.MobileNumber == mobileNumber);

        if (employee == null)
            return NotFound("Employee not found.");

        return Ok(employee);

    }
    [HttpGet]
    public async Task<IActionResult> GetAllEmployees()
    {
        var employees = await _context.Employees.ToListAsync();

        return Ok(employees);
    }
}
