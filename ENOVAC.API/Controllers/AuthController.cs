
using ENOVAC.API.Data;
using ENOVAC.API.Models;
using ENOVAC.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ENOVAC.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly EnovacDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly MessageCentralService _messageCentral;
    private readonly IMemoryCache _cache;

    public AuthController(
        EnovacDbContext context,
        IConfiguration configuration,
        MessageCentralService messageCentral,
        IMemoryCache cache)
    {
        _context = context;
        _configuration = configuration;
        _messageCentral = messageCentral;
        _cache = cache;
    }

    // REGISTER: Request OTP
    [HttpPost("register/request-otp")]
    public async Task<IActionResult> RegisterRequestOtp(
        [FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FullName) ||
            string.IsNullOrWhiteSpace(request.MobileNumber))
            return BadRequest("Full name and mobile number are required.");

        var fullName = request.FullName.Trim();
        var mobileNumber = request.MobileNumber.Trim();

        var existingEmployee = await _context.Employees
            .AnyAsync(e => e.MobileNumber == mobileNumber);

        if (existingEmployee)
            return Conflict("Mobile number already registered. Please login.");

        var result = await _messageCentral.SendOtpAsync(mobileNumber);

        if (!result.Success || string.IsNullOrWhiteSpace(result.VerificationId))
            return BadRequest(result.Message);

        var cacheKey = $"registration_{result.VerificationId}";

        _cache.Set(
            cacheKey,
            new RegisterRequest
            {
                FullName = fullName,
                MobileNumber = mobileNumber
            },
            TimeSpan.FromMinutes(2));

        return Ok(new
        {
            Message = result.Message,
            VerificationId = result.VerificationId
        });
    }

    // REGISTER: Verify OTP and create employee
    [HttpPost("register/verify-otp")]
    public async Task<IActionResult> RegisterVerifyOtp(
        [FromBody] RegisterVerifyRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.MobileNumber) ||
            string.IsNullOrWhiteSpace(request.VerificationId) ||
            string.IsNullOrWhiteSpace(request.Otp))
            return BadRequest("Mobile number, Verification ID and OTP are required.");

        var cacheKey = $"registration_{request.VerificationId}";

        if (!_cache.TryGetValue(cacheKey, out RegisterRequest? registration) ||
            registration == null)
            return BadRequest("Registration session expired. Please request a new OTP.");

        if (!string.Equals(
            registration.MobileNumber,
            request.MobileNumber.Trim(),
            StringComparison.Ordinal))
            return BadRequest("Mobile number does not match.");

        var existingEmployee = await _context.Employees
            .AnyAsync(e => e.MobileNumber == registration.MobileNumber);

        if (existingEmployee)
            return Conflict("Mobile number already registered. Please login.");

        var result = await _messageCentral.VerifyOtpAsync(
            request.VerificationId,
            request.Otp);

        if (!result.Success)
            return BadRequest(result.Message);

        var employee = new Employee
        {
            FullName = registration.FullName,
            MobileNumber = registration.MobileNumber,
            Role = "Employee",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Employees.Add(employee);

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Conflict("Mobile number already registered.");
        }

        _cache.Remove(cacheKey);

        return CreateTokenResponse(employee);
    }

    // LOGIN: Request OTP
    [HttpPost("login/request-otp")]
    public async Task<IActionResult> LoginRequestOtp(
        [FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.MobileNumber))
            return BadRequest("Mobile number is required.");

        var mobileNumber = request.MobileNumber.Trim();

        var employee = await _context.Employees
            .FirstOrDefaultAsync(e =>
                e.MobileNumber == mobileNumber && e.IsActive);

        if (employee == null)
            return NotFound("Employee not found. Please register first.");

        var result = await _messageCentral.SendOtpAsync(mobileNumber);

        if (!result.Success)
            return BadRequest(result.Message);

        return Ok(new
        {
            Message = result.Message,
            VerificationId = result.VerificationId
        });
    }

    // LOGIN: Verify OTP and generate JWT
    [HttpPost("login/verify-otp")]
    public async Task<IActionResult> LoginVerifyOtp(
        [FromBody] OtpRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.MobileNumber) ||
            string.IsNullOrWhiteSpace(request.VerificationId) ||
            string.IsNullOrWhiteSpace(request.Otp))
            return BadRequest("All fields are required.");

        var employee = await _context.Employees
            .FirstOrDefaultAsync(e =>
                e.MobileNumber == request.MobileNumber.Trim() &&
                e.IsActive);

        if (employee == null)
            return NotFound("Employee not found.");

        var result = await _messageCentral.VerifyOtpAsync(
            request.VerificationId,
            request.Otp);

        if (!result.Success)
            return BadRequest(result.Message);

        return CreateTokenResponse(employee);
    }

    // Generate JWT with role claim
    private IActionResult CreateTokenResponse(Employee employee)
    {
        var jwtKey = _configuration["Jwt:Key"];

        if (string.IsNullOrWhiteSpace(jwtKey))
            return StatusCode(500, "JWT signing key is missing.");

        var claims = new[]
        {
            new Claim(
                ClaimTypes.NameIdentifier,
                employee.EmployeeId.ToString()),

            new Claim(
                ClaimTypes.MobilePhone,
                employee.MobileNumber),

            new Claim(
                ClaimTypes.Role,
                employee.Role)
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtKey));

        var credentials = new SigningCredentials(
            key,
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(
                Convert.ToDouble(
                    _configuration["Jwt:ExpiryMinutes"])),
            signingCredentials: credentials);

        return Ok(new
        {
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            EmployeeId = employee.EmployeeId,
            FullName = employee.FullName,
            Role = employee.Role
        });
    }
}

// DTOs

public class RegisterRequest
{
    public string FullName { get; set; } = string.Empty;
    public string MobileNumber { get; set; } = string.Empty;
}

public class RegisterVerifyRequest
{
    public string MobileNumber { get; set; } = string.Empty;
    public string VerificationId { get; set; } = string.Empty;
    public string Otp { get; set; } = string.Empty;
}

public class LoginRequest
{
    public string MobileNumber { get; set; } = string.Empty;
}

public class OtpRequest
{
    public string MobileNumber { get; set; } = string.Empty;
    public string VerificationId { get; set; } = string.Empty;
    public string Otp { get; set; } = string.Empty;
}
