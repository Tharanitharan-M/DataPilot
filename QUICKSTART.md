# Quick Start Guide

Get DataPilot up and running in 5 minutes!

## Prerequisites

- Docker and Docker Compose installed
- Node.js 20+ (for local development)
- Python 3.13+ (for local development)

## Option 1: Docker (Recommended for Quick Start)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd DataPilot
```

### 2. Configure Environment

```bash
# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit the .env files if needed (defaults work for Docker)
```

### 3. Start Everything

```bash
# Using npm
npm run docker:up

# OR using make
make docker-up

# OR directly with docker-compose
docker-compose up -d
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/api/docs
- **Health Check**: http://localhost:8000/health

### 5. View Logs

```bash
npm run docker:logs
# OR
make docker-logs
# OR
docker-compose logs -f
```

### 6. Stop Services

```bash
npm run docker:down
# OR
make docker-down
# OR
docker-compose down
```

## Option 2: Local Development (Without Docker)

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Setup backend virtual environment
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### 2. Start Database Services

You'll need PostgreSQL and Redis running locally, or use Docker just for these:

```bash
# Start only database services
docker-compose up -d postgres redis
```

### 3. Configure Environment

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit backend/.env to point to your local database
# DATABASE_URL=postgresql://datapilot_user:datapilot_password@localhost:5432/datapilot_db
# REDIS_URL=redis://localhost:6379/0
```

### 4. Start Development Servers

```bash
# Terminal 1 - Start Backend
cd backend
source venv/bin/activate
uvicorn main:app --reload

# Terminal 2 - Start Frontend
cd frontend
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/api/docs

## Verify Installation

### Check Backend

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "app": "DataPilot",
  "version": "1.0.0",
  "environment": "development"
}
```

### Check Frontend

Open http://localhost:3000 in your browser. You should see the Next.js application running.

## Next Steps

1. **Explore the API Documentation**: Visit http://localhost:8000/api/docs
2. **Read the Full README**: See [README.md](./README.md) for detailed information
3. **Start Building**: Check out the project structure and start adding features
4. **Run Tests**: See testing instructions in [README.md](./README.md)

## Troubleshooting

### Port Already in Use

If you get port conflict errors:

```bash
# Check what's using the ports
lsof -i :3000  # Frontend
lsof -i :8000  # Backend
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis

# Kill the process or change ports in docker-compose.yml
```

### Docker Build Issues

```bash
# Rebuild containers from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Frontend Build Issues

```bash
cd frontend
rm -rf node_modules .next
npm install
npm run dev
```

### Backend Issues

```bash
cd backend
rm -rf __pycache__ .pytest_cache
source venv/bin/activate
pip install --upgrade -r requirements.txt
```

## Development Commands

### Using Make (Recommended)

```bash
make help           # Show all available commands
make setup          # Initial setup
make dev            # Start development
make docker-up      # Start Docker services
make docker-down    # Stop Docker services
make lint           # Run linters
make format         # Format code
make test           # Run tests
```

### Using npm

```bash
npm run dev              # Start both frontend and backend
npm run docker:up        # Start Docker services
npm run docker:down      # Stop Docker services
npm run lint             # Run linters
npm run format           # Format code
npm run test             # Run tests
```

## Need Help?

- Check the [README.md](./README.md) for detailed documentation
- See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines
- Open an issue on GitHub

Happy coding! 🚀

