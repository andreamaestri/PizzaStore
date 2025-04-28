# PizzaStore
[![.NET](https://img.shields.io/badge/.NET-9.0-blueviolet)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-19.0.0-61dafb)](https://react.dev/)
[![Azure Container Apps](https://img.shields.io/badge/Deployed%20on-Azure%20Container%20Apps-0078d4)](https://azure.microsoft.com/en-us/products/container-apps)
[![Lighthouse Performance](https://img.shields.io/badge/Performance-98-brightgreen)]()
[![Lighthouse Accessibility](https://img.shields.io/badge/Accessibility-98-brightgreen)]()
[![Lighthouse Best Practices](https://img.shields.io/badge/Best%20Practices-100-brightgreen)]()
[![Lighthouse SEO](https://img.shields.io/badge/SEO-90-yellowgreen)]()

![Screenshot 2025-04-28 162335](https://github.com/user-attachments/assets/ae8b21a1-af29-4bed-b941-c2bcf431e36f) 
![Screenshot 2025-04-28 162426](https://github.com/user-attachments/assets/f3ace119-3dad-4a23-a429-41fc4b8ddb42)

A full-stack pizza ordering application featuring a modern React frontend and an ASP.NET Core Minimal API backend. Built as part of the [Microsoft Learn tutorial: Create a full stack application by using React and minimal API for ASP.NET Core](https://learn.microsoft.com/en-us/training/modules/build-web-api-minimal-spa), this project demonstrates best practices in SPA development, API integration, and cloud deployment.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Deployed Application](#deployed-application)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Development](#development)
- [Building and Deployment](#building-and-deployment)
- [API Routes](#api-routes)
- [Quality Metrics](#quality-metrics)
- [References](#references)

---

## Project Overview

PizzaStore is a demonstration of a modern pizza ordering system, combining a responsive React single-page application (SPA) with a robust ASP.NET Core Minimal API backend. The project showcases:

- Construction of a SPA using React and Material UI (MUI) Toolpad components.
- Integration of a .NET 9 backend API with the frontend.
- Secure configuration using CORS.
- Automated build and deployment to Azure Container Apps.

---

## Deployed Application

The latest version of PizzaStore is deployed and available at:

**[https://pizzastore.gentlebeach-0aebcbc5.uksouth.azurecontainerapps.io/](https://pizzastore.gentlebeach-0aebcbc5.uksouth.azurecontainerapps.io/)**

---

## Project Structure

```
/PizzaClient      # React frontend application
/wwwroot          # Built frontend assets (generated from PizzaClient)
/Migrations       # Entity Framework Core migration files
/PizzaStore.Tests # Backend test files
/Properties       # Project properties and deployment profiles
Rest of files     # ASP.NET Core backend API
```

---

## Technologies Used

- **Frontend:** [React 19](https://react.dev/), [MUI](https://mui.com/), [MUI Toolpad](https://mui.com/toolpad/), Vite
- **Backend:** [ASP.NET Core Minimal API (.NET 9)](https://dotnet.microsoft.com/)
- **Database:** Entity Framework Core (with SQLite or SQL Server)
- **DevOps:** Docker, GitHub Actions, Azure Container Apps

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

The project is configured for automated build and deployment to Azure Container Apps.

### Automated Build Process

1. GitHub Actions workflow checks out the code.
2. Sets up Node.js and builds the React frontend:
   ```bash
   cd PizzaClient
   npm ci
   npm run build
   ```
   This outputs the frontend to the `/wwwroot` directory.
3. Builds and pushes the Docker container.
4. The Docker image includes the built frontend in `/wwwroot`.
5. The ASP.NET Core app uses `UseStaticFiles()` to serve frontend assets.
6. The root endpoint serves the frontend's `index.html`.

### Manual Build

To build and run locally:

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

![Screenshot 2025-04-28 164943](https://github.com/user-attachments/assets/54889abe-8710-4fd4-bde1-23d2d2891687)

The API is accessible under the `/api` route. All endpoints return and accept JSON.

| Method | Path                       | Description                                                      |
|--------|----------------------------|------------------------------------------------------------------|
| GET    | `/api`                     | Welcome message for API root.                                    |
|        |                            |                                                                  |
| **Pizza Endpoints**                 |                            |                                                                  |
| GET    | `/api/pizzas`              | Retrieve all pizzas with their base details.                     |
| GET    | `/api/pizzas/{id}`         | Retrieve a specific pizza by its ID.                             |
| POST   | `/api/pizzas`              | Create a new pizza.                                              |
| PUT    | `/api/pizzas/{id}`         | Update an existing pizza by ID.                                  |
| DELETE | `/api/pizzas/{id}`         | Delete a pizza by ID.                                            |
|        |                            |                                                                  |
| **Base Endpoints**                  |                            |                                                                  |
| GET    | `/api/bases`               | Retrieve all pizza bases.                                        |
| GET    | `/api/bases/{id}`          | Retrieve a specific pizza base by ID.                            |
|        |                            |                                                                  |
| **Order Endpoints**                 |                            |                                                                  |
| GET    | `/api/orders`              | Retrieve all orders with their items.                            |
| GET    | `/api/orders/{id}`         | Retrieve a specific order by ID.                                 |
| POST   | `/api/orders`              | Create a new order.                                              |
| PUT    | `/api/orders/{id}/status`  | Update the status of an order (e.g., to Delivered or Cancelled). |
| DELETE | `/api/orders/{id}`         | Cancel an order (cannot cancel if already delivered).            |

- Swagger UI is available at `/swagger` for interactive API documentation and testing.

---

## Quality Metrics

### Lighthouse Scores
![Screenshot 2025-04-28 162305](https://github.com/user-attachments/assets/156afbbd-62f3-4d57-a627-af4189178d10)



The deployed PizzaStore application has been evaluated using [Google Lighthouse](https://developers.google.com/web/tools/lighthouse) to ensure high standards of web quality. The latest scores for the production deployment are:

- **Performance:** 98
- **Accessibility:** 98
- **Best Practices:** 100
- **SEO:** 90

These results reflect a strong commitment to delivering a fast, accessible, and well-optimized user experience.

---

## References

- [Microsoft Learn: Create a full stack application by using React and minimal API for ASP.NET Core](https://learn.microsoft.com/en-us/training/modules/build-web-api-minimal-spa)
  - **Learning Objectives:**
    - Construct a front-end app using a single-page application (SPA) framework.
    - Connect an API in ASP.NET Core to an SPA application.
    - Configure the back-end application to use cross-origin resource sharing (CORS).
  - **Prerequisites:** JavaScript fundamentals, GitHub account, Visual Studio Code, web/HTTP basics.

---
