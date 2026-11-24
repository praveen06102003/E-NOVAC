
using Microsoft.EntityFrameworkCore;
using ENOVAC.API.Models;

namespace ENOVAC.API.Data;

public class EnovacDbContext : DbContext
{
    public EnovacDbContext(DbContextOptions<EnovacDbContext> options)
        : base(options)
    {
    }

    public DbSet<Employee> Employees { get; set; }
    public DbSet<MealType> MealTypes { get; set; }
    public DbSet<MenuItem> MenuItems { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<OrderItem> OrderItems { get; set; }
    public DbSet<Payment> Payments { get; set; }
    public DbSet<FoodLike> FoodLikes { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Employee configuration
        modelBuilder.Entity<Employee>()
            .HasIndex(e => e.MobileNumber)
            .IsUnique();

        modelBuilder.Entity<Employee>()
            .Property(e => e.Role)
            .HasDefaultValue("Employee");

        // Menu item configuration
        modelBuilder.Entity<MenuItem>()
            .Property(m => m.Price)
            .HasPrecision(10, 2);

        // Order configuration
        modelBuilder.Entity<Order>()
            .Property(o => o.TotalAmount)
            .HasPrecision(10, 2);

        // Order item configuration
        modelBuilder.Entity<OrderItem>()
            .Property(o => o.UnitPrice)
            .HasPrecision(10, 2);

        // Payment configuration
        modelBuilder.Entity<Payment>()
            .Property(p => p.Amount)
            .HasPrecision(10, 2);

        modelBuilder.Entity<Payment>()
            .HasIndex(p => p.OrderId)
            .IsUnique();

        // Food likes configuration
        modelBuilder.Entity<FoodLike>()
            .HasIndex(f => new { f.EmployeeId, f.MenuItemId })
            .IsUnique();

        // Meal type seed data
        modelBuilder.Entity<MealType>().HasData(
            new MealType { MealTypeId = 1, MealName = "Breakfast" },
            new MealType { MealTypeId = 2, MealName = "Lunch" },
            new MealType { MealTypeId = 3, MealName = "Evening Snacks" }
        );

        base.OnModelCreating(modelBuilder);
    }
}
