// Namespace for the Pizza model and DbContext
using PizzaStore.Models;
// Required for OpenApiInfo class used in Swagger setup
using Microsoft.OpenApi.Models;
// Required for Entity Framework Core functionalities like ToListAsync, AddAsync etc
using Microsoft.EntityFrameworkCore;
// Required for TypedResults
using Microsoft.AspNetCore.Http.HttpResults;

// --- 1. Application Builder Setup ---
var builder = WebApplication.CreateBuilder(args);

// --- 2. Service Configuration (Dependency Injection) ---
var connectionString = builder.Configuration.GetConnectionString("Pizzas") ?? "Data Source=Pizzas.db";

// Add Entity Framework Core DbContext for the Pizza database.
// Using an build services with the SQLite.
builder.Services.AddSqlite<PizzaDb>(connectionString);

// Add API explorer services. This is needed for tools like Swagger to discover API endpoints.
builder.Services.AddEndpointsApiExplorer();

// Add Swagger generator services to the DI container.
builder.Services.AddSwaggerGen(c =>
{
    // Define the Swagger document metadata (version, title, description).
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "PizzaStore API",
        Description = "An API to manage and order the pizzas you love.",
        Version = "v1"
    });
});

// Configure JSON serialization to ignore circular references and hide ToppingsJson
builder.Services.AddControllers().AddJsonOptions(options =>
{
    // Ignore cycles instead of preserving references
    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    // Use camelCase property names to match JavaScript conventions
    options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    // Add converter for ignoring ToppingsJson during serialization
    options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
});

// Configure JSON options for the minimal API endpoints
builder.Services.ConfigureHttpJsonOptions(options =>
{
    // Ignore cycles instead of preserving references
    options.SerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    options.SerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    options.SerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
});

// --- 3. Build the Application ---
// Creates the WebApplication instance configured with the defined services.
var app = builder.Build();

// Database seeding from JSON
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PizzaDb>();
    
    if (!db.Pizzas.Any() && !db.Bases.Any())
    {
        try
        {
            // Read the JSON file content
            var jsonData = File.ReadAllText("Pizza.json");
            var options = new System.Text.Json.JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };
            var data = System.Text.Json.JsonSerializer.Deserialize<PizzaJsonStructure>(jsonData, options);
            
            // Add bases
            if (data?.bases != null)
            {
                db.Bases.AddRange(data.bases);
                db.SaveChanges();
            }
            
            // Add pizzas with their bases properly linked
            if (data?.pizzas != null)
            {
                foreach (var pizza in data.pizzas)
                {
                    pizza.Base = db.Bases.Find(pizza.BaseId);
                    db.Pizzas.Add(pizza);
                }
                db.SaveChanges();
            }
            
            Console.WriteLine("Database seeded with JSON data!");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error seeding database: {ex.Message}");
        }
    }
}

// --- 4. HTTP Request Pipeline Configuration (Middleware) ---

// Configure Swagger middleware only for the development environment for security/performance.
if (app.Environment.IsDevelopment())
{
    // Enable middleware to serve the generated Swagger JSON definition file.
    app.UseSwagger(c =>
    {
        // Customize the URL endpoint for the Swagger JSON file.
        c.RouteTemplate = "api-docs/{documentName}/swagger.json";
    });

    // Enable middleware to serve the Swagger UI (interactive documentation).
    app.UseSwaggerUI(c =>
    {
        // Point the Swagger UI to the generated JSON file endpoint defined above.
        c.SwaggerEndpoint("/api-docs/v1/swagger.json", "PizzaStore API V1");

        // Serve the Swagger UI at the application's root path ('/') for easy access during development.
        c.RoutePrefix = string.Empty;
    });
}

// --- 5. API Endpoint Mapping ---

// Simple root endpoint for basic health check or welcome message.
app.MapGet("/", () => Results.Ok("Welcome to the PizzaStore API!"));

// Group all pizza-related endpoints under the '/api/pizzas' prefix.
var pizzaApi = app.MapGroup("/api/pizzas");

// GET /api/pizzas - Retrieve all pizzas with their related base
pizzaApi.MapGet("/", async (PizzaDb db) =>
    TypedResults.Ok(await db.Pizzas.Include(p => p.Base).ToListAsync()));

// GET /api/pizzas/{id} - Retrieve a specific pizza by its ID with its base
pizzaApi.MapGet("/{id:int}", async Task<Results<Ok<Pizza>, NotFound>> (PizzaDb db, int id) =>
{
    var pizza = await db.Pizzas
        .Include(p => p.Base)
        .FirstOrDefaultAsync(p => p.Id == id);
    
    return pizza is not null
        ? TypedResults.Ok(pizza)
        : TypedResults.NotFound();
});

// POST /api/pizzas - Create a new pizza
pizzaApi.MapPost("/", async Task<Results<Created<Pizza>, BadRequest>> (PizzaDb db, Pizza pizza) =>
{
    // Basic validation could be added here (e.g., check if Name is provided)
    if (string.IsNullOrWhiteSpace(pizza.Name))
    {
        return TypedResults.BadRequest(); // Simplified validation example
    }

    await db.Pizzas.AddAsync(pizza);
    await db.SaveChangesAsync();
    // Return a 201 Created status with the location of the new resource and the created pizza object.
    return TypedResults.Created($"/api/pizzas/{pizza.Id}", pizza);
});

// PUT /api/pizzas/{id} - Update an existing pizza
pizzaApi.MapPut("/{id:int}", async Task<Results<Ok<Pizza>, NotFound, BadRequest>> (PizzaDb db, int id, Pizza updatedPizza) =>
{    if (id != updatedPizza.Id)
    {
        // Ensure the ID in the route matches the ID in the body
        return TypedResults.BadRequest();
        
    }

    var existingPizza = await db.Pizzas.FindAsync(id);
    if (existingPizza is null)
    {
        return TypedResults.NotFound();
    }    // Update all properties
    existingPizza.Name = updatedPizza.Name;
    existingPizza.Description = updatedPizza.Description;
    existingPizza.BaseId = updatedPizza.BaseId;
    existingPizza.Toppings = updatedPizza.Toppings ?? new List<string>();

    await db.SaveChangesAsync();
    return TypedResults.Ok(existingPizza); // Return the updated pizza
});

// DELETE /api/pizzas/{id} - Delete a pizza by its ID
pizzaApi.MapDelete("/{id:int}", async Task<Results<NoContent, NotFound>> (PizzaDb db, int id) =>
{
    var pizza = await db.Pizzas.FindAsync(id);
    if (pizza is null)
    {
        return TypedResults.NotFound();
    }    db.Pizzas.Remove(pizza);
    await db.SaveChangesAsync();
    // Return a 204 No Content status indicating successful deletion.
    return TypedResults.NoContent();
});

// Create a new endpoint group for pizza bases
var basesApi = app.MapGroup("/api/bases");

// GET /api/bases - Retrieve all pizza bases
basesApi.MapGet("/", async (PizzaDb db) =>
    TypedResults.Ok(await db.Bases.ToListAsync()));

// GET /api/bases/{id} - Retrieve a specific base by ID
basesApi.MapGet("/{id:int}", async Task<Results<Ok<PizzaBase>, NotFound>> (PizzaDb db, int id) =>
{
    var pizzaBase = await db.Bases.FindAsync(id);
    
    return pizzaBase is not null
        ? TypedResults.Ok(pizzaBase)
        : TypedResults.NotFound();
});

// --- 6. Run the Application ---
// Starts the web server and makes the application listen for incoming HTTP requests.
app.Run();

// --- JSON Structure Class ---
// This class matches the structure of the Pizza.json file for deserialization
public class PizzaJsonStructure
{
    public List<PizzaBase>? bases { get; set; }
    public List<Pizza>? pizzas { get; set; }
}

// --- Helper Models (Assuming these are defined elsewhere, e.g., in Models folder) ---
/*
namespace PizzaStore.Models
{
    public class Pizza
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        // Add other properties like Description, Price, Ingredients etc.
    }

    public class PizzaDb : DbContext
    {
        public PizzaDb(DbContextOptions<PizzaDb> options) : base(options) { }
        public DbSet<Pizza> Pizzas { get; set; } = null!; // Initialize with null forgiving operator
    }
}
*/