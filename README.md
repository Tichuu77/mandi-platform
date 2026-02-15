# Mandi Platform

> Multi-tenant SaaS platform for agricultural market management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker Desktop
- Git

### Installation

1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/mandi-platform.git
cd mandi-platform
```

2. Install dependencies
```bash
npm install
```

3. Start infrastructure (MongoDB, Redis, Kafka)
```bash
docker-compose up -d
```

4. Verify all services are running
```bash
docker-compose ps
```

### Development

Start all services:
```bash
npm run dev
```

Start individual services:
```bash
npm run dev:auth      # Auth Service
npm run dev:gateway   # API Gateway
npm run dev:client    # Frontend
```

## 📁 Project Structure
mandi-platform/
├── services/          # Backend microservices
├── client/           # Frontend React app
├── shared/           # Shared code (proto, utils)
├── infrastructure/   # Docker, K8s configs
├── scripts/          # Build scripts
└── docs/            # Documentation

## 🛠️ Technology Stack

### Backend
- Node.js + Express
- gRPC
- Apache Kafka
- MongoDB
- Redis

### Frontend
- React 18
- Redux Toolkit
- Tailwind CSS
- shadcn/ui

## 📚 Documentation

- [Architecture](./docs/architecture.md)
- [Development Guide](./docs/development.md)
- [API Documentation](./docs/api.md)

## 🧪 Testing
```bash
npm test              # Run all tests
npm run test:services # Test services only
npm run test:client   # Test frontend only
```

## 📝 License

MIT

## 👥 Team

Akash Tikhat - [@linkdin](www.linkedin.com/in/akash-tikhat-9b8261219)