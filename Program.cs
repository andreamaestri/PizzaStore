using PizzaStore.Models;
// Namespace for the PizzaStore database context and models.
using  PizzaStore.DB;
// Required for OpenApiInfo class used in Swagger setup.
using Microsoft.OpenApi.Models;
// Required for the WebApplication class and related methods.
using Microsoft.EntityFrameworkCore;

// Standard web application builder setup.
var builder = WebApplication.CreateBuilder(args);

// --- Service Configuration ---
// Add API explorer services; needed for Swagger to discover minimal API endpoints.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddDbContext<PizzaDb>(options => options.UseInMemoryDatabase("items"));
// Add Swagger generator services to the dependency injection container.
builder.Services.AddSwaggerGen(c =>
{
    // Define the Swagger document (v1) with title, description, and version.
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "PizzaStore API", Description = "An API to order the Pizzas you love", Version = "v1" });
});

// Build the WebApplication instance from the configured builder.
var app = builder.Build();

// --- HTTP Request Pipeline Configuration ---

// Configure Swagger middleware only for the development environment.
if (app.Environment.IsDevelopment())
{
    // Enable middleware to serve generated Swagger JSON.
    app.UseSwagger(c =>
    {
        // Customize the endpoint for the Swagger JSON file (default is /swagger/{documentName}/swagger.json).
        c.RouteTemplate = "api-docs/{documentName}/swagger.json";
    });

    // Enable middleware to serve the Swagger UI (HTML, JS, CSS, etc.).
    app.UseSwaggerUI(c =>
    {
        // Point the Swagger UI to the generated JSON file endpoint defined above.
        c.SwaggerEndpoint("/api-docs/v1/swagger.json", "PizzaStore API V1");

        // Serve the Swagger UI at the application root ('/') instead of the default '/swagger'.
        c.RoutePrefix = string.Empty;
    });
}

// Define a simple root GET endpoint for testing.
app.MapGet("/", () => "Hello World!");
// Define a GET endpoint to retrieve a list of pizzas.
app.MapGet("/pizzas/{id}", (int id) => PizzaDB.GetPizza(id));
app.MapGet("/pizzas", () => PizzaDB.GetPizzas());
app.MapPost("/pizzas", (Pizza pizza) => PizzaDB.CreatePizza(pizza));
app.MapPut("/pizzas", (Pizza pizza) => PizzaDB.UpdatePizza(pizza));
app.MapDelete("/pizzas/{id}", (int id) => PizzaDB.RemovePizza(id));

// Start the application and listen for requests.
app.Run();