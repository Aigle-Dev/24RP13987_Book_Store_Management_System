# Bookstore Microservices Project

A modern bookstore application built with microservices architecture, featuring order management and inventory control systems.

## Overview

This project implements a bookstore system with the following components:
- Backend API service
- Orders microservice
- Inventory microservice

## Tech Stack

- Node.js
- SQLite Database
- Docker
- Kubernetes
- Jenkins (CI/CD)

## Quick Start

### Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
   The server will start at http://localhost:4000

### Using Docker Compose

For local development with Docker:

```bash
docker-compose up
```

This will start:
- Main application on port 4000
- SQLite database with persistent storage

## Services

### Orders Service (Port 4001)

Manages customer orders and transactions.

Key endpoints:
- GET /api/orders - List all orders
- POST /api/orders - Create new order
- GET /api/orders/:id - Get order details

### Inventory Service (Port 4002)

Handles book inventory and stock management.

Key endpoints:
- GET /api/inventory - List available books
- PUT /api/inventory/:id - Update book stock
- GET /api/inventory/:id - Get book details

## Deployment

### Kubernetes Deployment

The application can be deployed to Kubernetes using the provided manifests:

```bash
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/microservice-deployment.yaml
kubectl apply -f k8s/nginx-ingress.yaml
```

### CI/CD Pipeline

The project includes a Jenkins pipeline that:
1. Runs tests
2. Builds Docker images
3. Pushes images to registry
4. Deploys to Kubernetes

## Development

### Testing

Run the test suite:

```bash
npm run test
```

Tests are located in the `__tests__` directory.

### Project Structure

```
├── config/           # Configuration files
├── data/            # SQLite database
├── repositories/    # Data access layer
├── routes/          # API routes
├── k8s/             # Kubernetes manifests
├── jenkins/         # CI/CD pipeline
└── __tests__/       # Test files
```

## Environment Variables

- `NODE_ENV`: Application environment (development/production)
- `DOCKER_REGISTRY`: Docker registry for image storage
- `KUBE_CONFIG`: Kubernetes configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## License