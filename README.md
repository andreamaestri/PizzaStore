# PizzaStore

A full-stack pizza ordering application with a React frontend and ASP.NET Core Minimal API backend.

[![.NET](https://img.shields.io/badge/.NET-9.0-blue)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-19.0.0-61dafb?logo=react)](https://react.dev/)
[![MUI Toolpad](https://img.shields.io/badge/MUI%20Toolpad-0.14.0-007fff?logo=mui)](https://mui.com/toolpad/)
[![Azure Container Apps](https://img.shields.io/badge/Azure%20Container%20Apps-Deployed-0078d4?logo=microsoft-azure)](https://azure.microsoft.com/en-us/products/container-apps/)

---

## Table of Contents

- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Development](#development)
- [Building and Deployment](#building-and-deployment)
  - [Deployed Application](#deployed-application)
  - [How the Build Process Works](#how-the-build-process-works)
  - [Manual Build](#manual-build)
- [API Routes](#api-routes)
- [References](#references)

---

## Project Structure

- `/PizzaClient` — React frontend application
- `/wwwroot` — Built frontend assets (generated from PizzaClient)
- Other root files — ASP.NET Core backend API

---

## Technologies Used

- **.NET 9** — ASP.NET Core Minimal API backend
- **React 19** — Frontend SPA framework
- **MUI Toolpad** — UI components and rapid prototyping
- **Vite** — Frontend build tool
- **Docker** — Containerization for deployment
- **Azure Container Apps** — Cloud hosting for production deployment

---

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

---

## Building and Deployment

The project is set up to automatically build and deploy to Azure Container Apps.

### Deployed Application

Access the live application here:  
**[https://pizzastore.gentlebeach-0aebcbc5.uksouth.azurecontainerapps.io/](https://pizzastore.gentlebeach-0aebcbc5.uksouth.azurecontainerapps.io/)**

### How the Build Process Works

1. The GitHub Actions workflow checks out the code.
2. It sets up Node.js and builds the React frontend:
   ```bash
   cd PizzaClient
   npm ci
   npm run build
   ```
   This builds the frontend to the `/wwwroot` directory.
3. The workflow then builds and pushes the Docker container.
4. The Docker container includes the built frontend in the `/wwwroot` directory.
5. In the ASP.NET Core application, the `UseStaticFiles()` middleware serves the frontend files.
6. The root endpoint is configured to serve the frontend's `index.html`.

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

---

## API Routes

- The API is accessible under the `/api` route.
- The Swagger UI is available at `/swagger` when running in development mode.

---

## References

- **Microsoft Learn Tutorial:**  
  [Create a full stack application by using React and minimal API for ASP.NET Core](https://learn.microsoft.com/en-us/training/modules/build-web-api-minimal-spa)
  - Construct a front-end app by using a single-page application (SPA) framework.
  - Connect an API in ASP.NET Core to an SPA application.
  - Configure the back-end application to use cross-origin resource sharing (CORS).

---
