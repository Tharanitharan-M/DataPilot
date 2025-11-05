# DataPilot

A modern full-stack application built with Next.js and FastAPI.

## 🚀 Tech Stack

### Frontend
- **Next.js 16+** with App Router
- **TypeScript** for type safety
- **Tailwind CSS 4** for styling
- **shadcn/ui** for UI components
- **React 19** for building interactive UIs

### Backend
- **FastAPI** for high-performance API
- **PostgreSQL** for database
- **Redis** for caching
- **SQLAlchemy** for ORM
- **Pydantic** for data validation
- **JWT** for authentication

### Infrastructure
- **Docker Compose** for local development
- **Docker** for containerization

## 📁 Project Structure

```
DataPilot/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # React components
│   │   └── lib/             # Utility functions
│   ├── public/              # Static assets
│   └── package.json
│
├── backend/                  # FastAPI backend application
│   ├── app/
│   │   ├── api/             # API routes and dependencies
│   │   ├── core/            # Core configuration
│   │   ├── db/              # Database setup
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # Business logic
│   │   └── utils/           # Utility functions
│   ├── main.py              # Application entry point
│   └── requirements.txt     # Python dependencies
│
├── infrastructure/           # Infrastructure as Code
│   └── init-scripts/        # Database initialization scripts
│
├── shared/                   # Shared code/types between frontend & backend
│
└── docker-compose.yml        # Local development environment
```

## 🛠️ Getting Started

### Prerequisites

- **Node.js** 20+ and npm 10+
- **Python** 3.13+
- **Docker** and Docker Compose
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DataPilot
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Backend:
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   ```
   
   Frontend:
   ```bash
   cp frontend/.env.example frontend/.env
   # Edit frontend/.env with your configuration
   ```

4. **Install project dependencies**
   ```bash
   npm run setup
   ```

### Development with Docker (Recommended)

1. **Start all services**
   ```bash
   npm run docker:up
   ```

2. **Access the applications**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/api/docs
   - PostgreSQL: localhost:5432
   - Redis: localhost:6379

3. **View logs**
   ```bash
   npm run docker:logs
   ```

4. **Stop all services**
   ```bash
   npm run docker:down
   ```

### Development without Docker

1. **Start the backend**
   ```bash
   cd backend
   source venv/bin/activate
   uvicorn main:app --reload
   ```

2. **Start the frontend (in a new terminal)**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the applications**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/api/docs

## 📝 Available Scripts

### Root Level
- `npm run dev` - Start both frontend and backend in development mode
- `npm run docker:up` - Start all services with Docker Compose
- `npm run docker:down` - Stop all Docker services
- `npm run docker:build` - Rebuild Docker images
- `npm run lint` - Run linters for both frontend and backend
- `npm run format` - Format code for both frontend and backend
- `npm run test` - Run tests for both frontend and backend

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

### Backend
- `uvicorn main:app --reload` - Start development server
- `pytest` - Run tests
- `black .` - Format code with Black
- `flake8 .` - Run linter
- `mypy .` - Run type checker

## 🗄️ Database

### Migrations with Alembic

```bash
cd backend

# Create a new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

## 🔒 Environment Variables

### Backend (.env)
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `SECRET_KEY` - JWT secret key
- `CORS_ORIGINS` - Allowed CORS origins

### Frontend (.env)
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXTAUTH_SECRET` - NextAuth.js secret

## 🧪 Testing

### Frontend
```bash
cd frontend
npm test
```

### Backend
```bash
cd backend
source venv/bin/activate
pytest
```

## 📦 Building for Production

### Frontend
```bash
cd frontend
npm run build
npm start
```

### Backend
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run linters and tests
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
