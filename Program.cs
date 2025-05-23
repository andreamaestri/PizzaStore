// Namespace for the Pizza model and DbContext
// Required for TypedResults
using Microsoft.AspNetCore.Http.HttpResults;
// Required for Entity Framework Core functionalities like ToListAsync, AddAsync etc
using Microsoft.EntityFrameworkCore;
// Required for OpenApiInfo class used in Swagger setup
using Microsoft.OpenApi.Models;
using PizzaStore.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

// --- 1. Application Builder Setup ---
var builder = WebApplication.CreateBuilder(args);
// Bind Kestrel to the port Azure Container Apps gives us (default to 80)
var port = Environment.GetEnvironmentVariable("PORT") ?? "80";
builder.WebHost.UseUrls($"http://*:{port}");

// --- 2. Service Configuration (Dependency Injection) ---
var connectionString = builder.Configuration.GetConnectionString("Pizzas") ?? "Data Source=Pizzas.db";

// Add Entity Framework Core DbContext for the Pizza database.
// Using an build services with the SQLite.
builder.Services.AddSqlite<PizzaDb>(connectionString);

// Add services for security features (Authentication, Authorization, CORS)
builder.Services.AddAuthentication();
builder.Services.AddAuthorization();
builder.Services.AddCors(); // Configure policies later as needed

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
    // Add server information for Azure
    c.AddServer(new OpenApiServer
    {
        Url = "https://pizzastore.gentlebeach-0aebcbc5.uksouth.azurecontainerapps.io",
        Description = "Production API Server (Container Apps)"
    });
    // Clean up tags for Azure compatibility
    c.DocumentFilter<TagCleanupDocumentFilter>();
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

// Database seeding from JSON and ensure migrations are applied
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PizzaDb>();
    // Ensure database and tables are created/migrated
    db.Database.Migrate();

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

// Configure CORS to allow frontend to API communication
app.UseCors(builder => builder
    .AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader());

// Serve static files from wwwroot folder (contains the frontend)
app.UseStaticFiles();

// Always enable Swagger JSON endpoint for Azure and local use
app.UseSwagger(c =>
{
    c.RouteTemplate = "swagger/{documentName}/swagger.json";
});

// Always enable Swagger UI for easier API testing and documentation
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "PizzaStore API V1");
    c.RoutePrefix = "swagger";
});

// Add standard security middleware
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

// --- 5. API Endpoint Mapping ---

// Change the root endpoint to serve index.html instead of returning a welcome message
app.MapGet("/api", () => Results.Ok("Welcome to the PizzaStore API!"));

// SPA fallback for client-side routing, but exclude paths that should be handled by the server
// This prevents React Router from capturing Swagger and API requests
app.MapFallbackToFile("index.html");

// Configure middleware order to ensure Swagger endpoints work properly
app.Use(async (context, next) =>
{
    // Skip middleware for Swagger paths
    if (context.Request.Path.StartsWithSegments("/swagger"))
    {
        await next();
        return;
    }
    
    await next();
});

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
    }
    db.Pizzas.Remove(pizza);
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

// --- Order Endpoints ---
var ordersApi = app.MapGroup("/api/orders");

// GET /api/orders - Retrieve all orders with their items
ordersApi.MapGet("/", async (PizzaDb db) =>
    TypedResults.Ok(await db.Orders
        .Include(o => o.Items)
        .ThenInclude(i => i.Pizza)
        .ToListAsync()));

// GET /api/orders/{id} - Retrieve a specific order by its ID
ordersApi.MapGet("/{id:int}", async Task<Results<Ok<Order>, NotFound>> (PizzaDb db, int id) =>
{
    var order = await db.Orders
        .Include(o => o.Items)
        .ThenInclude(i => i.Pizza)
        .FirstOrDefaultAsync(o => o.Id == id);
    return order is not null
        ? TypedResults.Ok(order)
        : TypedResults.NotFound();
});

// POST /api/orders - Create a new order
ordersApi.MapPost("/", async Task<Results<Created<Order>, BadRequest>> (PizzaDb db, Order order) =>
{
    if (order.Items == null || order.Items.Count == 0)
    {
        return TypedResults.BadRequest();
    }
    decimal totalAmount = 0;
    // Fetch all required pizza details in a single query to avoid N+1
    var pizzaIds = order.Items.Select(item => item.PizzaId).Distinct().ToList();
    var pizzas = await db.Pizzas
        .Where(p => pizzaIds.Contains(p.Id))
        .ToDictionaryAsync(p => p.Id);

    foreach (var item in order.Items)
    {
        if (!pizzas.TryGetValue(item.PizzaId, out var pizza))
        {
            // If any pizza ID is invalid, return BadRequest
            return TypedResults.BadRequest();
        }
        item.Pizza = pizza; // Link the fetched pizza entity
        item.UnitPrice = pizza.Price;
        totalAmount += item.UnitPrice * item.Quantity;
    }
    order.TotalAmount = totalAmount;
    order.OrderDate = DateTime.Now;
    await db.Orders.AddAsync(order);
    await db.SaveChangesAsync();
    return TypedResults.Created($"/api/orders/{order.Id}", order);
});

// PUT /api/orders/{id}/status - Update an order's status
ordersApi.MapPut("/{id:int}/status", async Task<Results<Ok<Order>, NotFound, BadRequest>> (PizzaDb db, int id, [Microsoft.AspNetCore.Mvc.FromQuery] PizzaStore.Models.OrderStatus newStatus) =>
{
    var order = await db.Orders.FindAsync(id);
    if (order is null)
    {
        return TypedResults.NotFound();
    }
    order.Status = newStatus;
    await db.SaveChangesAsync();
    return TypedResults.Ok(order);
});

// DELETE /api/orders/{id} - Cancel an order
ordersApi.MapDelete("/{id:int}", async Task<Results<NoContent, NotFound, BadRequest>> (PizzaDb db, int id) =>
{
    var order = await db.Orders.FindAsync(id);
    if (order is null)
    {
        return TypedResults.NotFound();
    }
    if (order.Status == PizzaStore.Models.OrderStatus.Delivered)
    {
        return TypedResults.BadRequest();
    }
    order.Status = PizzaStore.Models.OrderStatus.Cancelled;
    await db.SaveChangesAsync();
    return TypedResults.NoContent();
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

// --- TagCleanupDocumentFilter for Swagger/OpenAPI ---
public class TagCleanupDocumentFilter : IDocumentFilter
{
    public void Apply(OpenApiDocument swaggerDoc, DocumentFilterContext context)
    {
        // Replace tags with simple names based on path
        foreach (var path in swaggerDoc.Paths)
        {
            foreach (var op in path.Value.Operations)
            {
                // Use the first segment after /api/ as the tag, or fallback to "API"
                var segments = path.Key.Split('/', StringSplitOptions.RemoveEmptyEntries);
                string tag = segments.Length > 1 ? segments[1].TrimEnd('s') : "API";
                op.Value.Tags.Clear();
                op.Value.Tags.Add(new OpenApiTag { Name = tag });
            }
        }
    }
}

// --- Helper Models (Assuming these are defined elsewhere, e.g., in Models folder) ---
// Removed commented-out PizzaStore.Models namespace block