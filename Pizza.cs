using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace PizzaStore.Models
{
    public class Pizza
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public int BaseId { get; set; }
        public PizzaBase? Base { get; set; }        // Dynamic pricing support
        public decimal Price { get; set; }

        public string? ToppingsJson { get; set; }

        [NotMapped]
        public List<string> Toppings
        {
            get => string.IsNullOrEmpty(ToppingsJson) ? new List<string>() :
                  JsonSerializer.Deserialize<List<string>>(ToppingsJson) ?? new List<string>();
            set => ToppingsJson = JsonSerializer.Serialize(value);
        }

        public string? Description { get; set; }
    }

    public class PizzaBase
    {
        public int Id { get; set; }
        public string? Name { get; set; }

        // Navigation property
        [JsonIgnore]
        public List<Pizza> Pizzas { get; set; } = new List<Pizza>();
    }

    public class Order
    {
        public int Id { get; set; }
        public DateTime OrderDate { get; set; } = DateTime.Now;
        public string? CustomerName { get; set; }
        public string? Address { get; set; }
        public string? PhoneNumber { get; set; }
        public decimal TotalAmount { get; set; }
        public OrderStatus Status { get; set; } = OrderStatus.Pending;
        // Navigation property
        public List<OrderItem> Items { get; set; } = new List<OrderItem>();
    }

    public class OrderItem
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public int PizzaId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        // Navigation properties
        public Order? Order { get; set; }
        public Pizza? Pizza { get; set; }
    }

    public enum OrderStatus
    {
        Pending,
        InProgress,
        Ready,
        Delivered,
        Cancelled
    }

    class PizzaDb : DbContext
    {
        public PizzaDb(DbContextOptions options) : base(options) { }
        public DbSet<Pizza> Pizzas { get; set; } = null!;
        public DbSet<PizzaBase> Bases { get; set; } = null!;
        public DbSet<Order> Orders { get; set; } = null!;
        public DbSet<OrderItem> OrderItems { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configure the relationship
            modelBuilder.Entity<Pizza>()
                .HasOne(p => p.Base)
                .WithMany(b => b.Pizzas)
                .HasForeignKey(p => p.BaseId);

            // Order relationships
            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Order)
                .WithMany(o => o.Items)
                .HasForeignKey(oi => oi.OrderId);

            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Pizza)
                .WithMany()
                .HasForeignKey(oi => oi.PizzaId);
        }
    }

}