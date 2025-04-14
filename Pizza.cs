using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
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
        public PizzaBase? Base { get; set; }

        public decimal Price { get; set; } // Dynamic pricing support

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
    
    class PizzaDb : DbContext
    {
        public PizzaDb(DbContextOptions options) : base(options) { }
        public DbSet<Pizza> Pizzas { get; set; } = null!;
        public DbSet<PizzaBase> Bases { get; set; } = null!;
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configure the relationship
            modelBuilder.Entity<Pizza>()
                .HasOne(p => p.Base)
                .WithMany(b => b.Pizzas)
                .HasForeignKey(p => p.BaseId);
        }
    }

}