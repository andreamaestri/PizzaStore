# PizzaStore

A full-stack pizza ordering application with React frontend and .NET backend.

## Project Structure

- `/PizzaClient` - React frontend application
- `/wwwroot` - Built frontend assets (generated from PizzaClient)
- Rest of the files - ASP.NET Core backend API

## Development

### Backend

```bash
dotnet run
```

### Frontend

```bash
cd PizzaClient
npm install
npm run dev
```

## Building and Deployment

The project is set up to automatically build and deploy to Azure Container Apps.

### How the Build Process Works

1. The GitHub Actions workflow checks out the code
2. It sets up Node.js and builds the React frontend:
   ```bash
   cd PizzaClient
   npm ci
   npm run build
   ```
   This builds the frontend to the `/wwwroot` directory
3. The workflow then builds and pushes the Docker container
4. The Docker container includes the built frontend in the `/wwwroot` directory
5. In the ASP.NET Core application, the `UseStaticFiles()` middleware serves the frontend files
6. The root endpoint is configured to serve the frontend's `index.html`

### Manual Build

To build the application manually:

1. Build the frontend:
   ```bash
   cd PizzaClient
   npm install
   npm run build
   ```
2. Build the .NET application:
   ```bash
   dotnet publish -c Release
   ```
3. Build and run the Docker container:
   ```bash
   docker build -t pizzastore:latest .
   docker run -p 80:80 pizzastore:latest
   ```

## API Routes

- The API is accessible under the `/api` route
- The Swagger UI is available at `/swagger` when running in development mode
