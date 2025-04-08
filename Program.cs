// Namespace for the Pizza model and DbContext
using PizzaStore.Models;
// Required for OpenApiInfo class used in Swagger setup.
using Microsoft.OpenApi.Models;
// Required for Entity Framework Core functionalities like ToListAsync, AddAsync etc.
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http.HttpResults; // Required for TypedResults

// --- 1. Application Builder Setup ---
var builder = WebApplication.CreateBuilder(args);

// --- 2. Service Configuration (Dependency Injection) ---

// Add Entity Framework Core DbContext for the Pizza database.
// Using an in-memory database for simplicity in this example.
builder.Services.AddDbContext<PizzaDb>(options => options.UseInMemoryDatabase("PizzaDbInMemory"));

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

// --- 3. Build the Application ---
// Creates the WebApplication instance configured with the defined services.
var app = builder.Build();

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

// GET /api/pizzas - Retrieve all pizzas
pizzaApi.MapGet("/", async (PizzaDb db) =>
    TypedResults.Ok(await db.Pizzas.ToListAsync()));

// GET /api/pizzas/{id} - Retrieve a specific pizza by its ID
pizzaApi.MapGet("/{id:int}", async Task<Results<Ok<Pizza>, NotFound>> (PizzaDb db, int id) =>
{
    var pizza = await db.Pizzas.FindAsync(id);
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
{
    if (id != updatedPizza.Id)
    {
        // Ensure the ID in the route matches the ID in the body
        return TypedResults.BadRequest();
    }

    var existingPizza = await db.Pizzas.FindAsync(id);
    if (existingPizza is null)
    {
        return TypedResults.NotFound();
    }

    // Update properties (could use a mapping tool like AutoMapper in real apps)
    existingPizza.Name = updatedPizza.Name;
    // Update other properties as needed...
    // existingPizza.Description = updatedPizza.Description;
    // existingPizza.Price = updatedPizza.Price;

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
    }

    db.Pizzas.Remove(pizza);
    await db.SaveChangesAsync();
    // Return a 204 No Content status indicating successful deletion.
    return TypedResults.NoContent();
});


// --- 6. Run the Application ---
// Starts the web server and makes the application listen for incoming HTTP requests.
app.Run();

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