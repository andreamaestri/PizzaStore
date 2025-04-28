# PizzaStore &mdash; Full Stack Pizza Ordering App

[![.NET](https://img.shields.io/badge/.NET-9.0-blueviolet?logo=dotnet)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-19.0.0-61dafb?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.3.3-646cff?logo=vite)](https://vitejs.dev/)
[![Material UI](https://img.shields.io/badge/Material%20UI-7.0.1-007fff?logo=mui)](https://mui.com/)
[![MUI Toolpad](https://img.shields.io/badge/MUI%20Toolpad-0.14.0-007fff?logo=mui)](https://mui.com/toolpad/)
[![Azure Container Apps](https://img.shields.io/badge/Azure%20Container%20Apps-Deployed-0089d6?logo=microsoftazure)](https://azure.microsoft.com/en-us/products/container-apps/)
[![Swagger UI](https://img.shields.io/badge/Swagger-UI-85ea2d?logo=swagger)](https://swagger.io/tools/swagger-ui/)

---

A portfolio-ready, full-stack pizza ordering application built with a React frontend (leveraging Material UI and MUI Toolpad components) and an ASP.NET Core Minimal API backend targeting .NET 9. This project demonstrates proficiency in modern web development and is based on the [Microsoft Learn tutorial: "Create a full stack application by using React and minimal API for ASP.NET Core"](https://learn.microsoft.com/en-us/training/modules/build-web-api-minimal-spa).

## Table of Contents

- [Project Overview](#project-overview)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Setup & Development](#setup--development)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [API Documentation](#api-documentation)
- [Build & Deployment](#build--deployment)
  - [Azure Container Apps](#azure-container-apps)
  - [Manual Build](#manual-build)
- [Learning Outcomes](#learning-outcomes)
- [References](#references)

---

## Project Overview

PizzaStore is a demonstration project that showcases the creation of a single-page application (SPA) with a modern React frontend and a robust ASP.NET Core Minimal API backend. It is designed as a learning portfolio piece, reflecting progress in .NET and full-stack development.

Key features include:

- Interactive pizza ordering UI with Material UI components
- Persistent basket and order management
- RESTful API with Swagger UI documentation
- Modern build tooling and deployment pipeline

---

## Technologies Used

- **Frontend**
  - [React 19](https://react.dev/)
  - [Vite](https://vitejs.dev/) (build tool)
  - [Material UI](https://mui.com/) (component library)
  - [MUI Toolpad](https://mui.com/toolpad/) (UI components and low-code tooling)
  - [Emotion](https://emotion.sh/) (styling)
  - [React Router](https://reactrouter.com/) (routing)
- **Backend**
  - [ASP.NET Core 9 Minimal API](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis) (targeting .NET 9)
  - [Entity Framework Core](https://learn.microsoft.com/en-us/ef/core/)
  - [Swagger UI](https://swagger.io/tools/swagger-ui/) (API docs)
- **DevOps & Deployment**
  - [Docker](https://www.docker.com/)
  - [Azure Container Apps](https://azure.microsoft.com/en-us/products/container-apps/)
  - [GitHub Actions](https://github.com/features/actions)

---

## Project Structure

```
/
├── PizzaClient/           # React frontend application
│   ├── src/               # Frontend source code (components, pages, services)
│   ├── package.json       # Frontend dependencies and scripts
│   └── vite.config.js     # Vite configuration
├── wwwroot/               # Built frontend assets (output from PizzaClient)
├── Migrations/            # Entity Framework Core migrations
├── PizzaStore.Tests/      # Backend unit tests
├── Program.cs             # ASP.NET Core Minimal API entry point
├── PizzaStore.csproj      # .NET project file
├── Dockerfile             # Container build instructions
└── README.md              # Project documentation
```

---

## Setup & Development

### Backend

1. **Install .NET 9 SDK**
   [Download here](https://dotnet.microsoft.com/download/dotnet/9.0)

2. **Run the API locally:**
   ```bash
   dotnet run
   ```

3. The API will be available at `http://localhost:5000` (default) and Swagger UI at `/swagger`.

### Frontend

1. **Install Node.js (v18+)**  
   [Download here](https://nodejs.org/)

2. **Install dependencies:**
   ```bash
   cd PizzaClient
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173` (default).

---

## API Documentation

- **Base URL:** `/api`
- **Swagger UI:** Available at `/swagger` when running in development mode

**Example Endpoints:**
- `GET /api/pizzas` &mdash; List available pizzas
- `POST /api/orders` &mdash; Place a new order
- `GET /api/orders/{id}` &mdash; Retrieve order details

The API follows RESTful conventions and is documented via Swagger UI for easy exploration and testing.

---

## Build & Deployment

### Azure Container Apps

The project is configured for automated deployment to Azure Container Apps using GitHub Actions and Docker.

**Build & Deploy Steps:**
1. GitHub Actions workflow checks out the code
2. Installs Node.js and builds the frontend:
   ```bash
   cd PizzaClient
   npm ci
   npm run build
   ```
   (Build output is placed in `/wwwroot`)
3. Builds and pushes the Docker container
4. The container serves both the API and static frontend assets

### Manual Build

To build and run the application locally or on your own infrastructure:

1. **Build the frontend:**
   ```bash
   cd PizzaClient
   npm install
   npm run build
   ```
2. **Build the .NET backend:**
   ```bash
   dotnet publish -c Release
   ```
3. **Build and run the Docker container:**
   ```bash
   docker build -t pizzastore:latest .
   docker run -p 80:80 pizzastore:latest
   ```

---

## Learning Outcomes

This project demonstrates:

- Building a modern SPA with React, Material UI, and MUI Toolpad
- Creating a RESTful API using ASP.NET Core Minimal API (targeting .NET 9)
- Connecting a frontend SPA to a backend API
- Configuring CORS for secure cross-origin requests
- Using Swagger UI for API documentation
- Implementing CI/CD and containerization for cloud deployment

**Based on the Microsoft Learn module:**  
[Create a full stack application by using React and minimal API for ASP.NET Core](https://learn.microsoft.com/en-us/training/modules/build-web-api-minimal-spa)

---

## References

- [Microsoft Learn: Build a web API with minimal SPA](https://learn.microsoft.com/en-us/training/modules/build-web-api-minimal-spa)
- [ASP.NET Core Minimal APIs](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis)
- [React Documentation](https://react.dev/)
- [Material UI Documentation](https://mui.com/)
- [Vite Documentation](https://vitejs.dev/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [Azure Container Apps](https://azure.microsoft.com/en-us/products/container-apps/)
