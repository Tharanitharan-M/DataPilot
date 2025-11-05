.PHONY: help setup dev docker-up docker-down docker-build lint format test clean

help: ## Show this help message
	@echo "Usage: make [target]"
	@echo ""
	@echo "Available targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

setup: ## Install all dependencies
	@echo "Installing root dependencies..."
	npm install
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "Setting up backend..."
	cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt
	@echo "Setup complete!"

dev: ## Start development servers
	npm run dev

docker-up: ## Start Docker services
	docker-compose up -d

docker-down: ## Stop Docker services
	docker-compose down

docker-build: ## Build Docker images
	docker-compose build

docker-logs: ## View Docker logs
	docker-compose logs -f

lint: ## Run linters
	@echo "Linting frontend..."
	cd frontend && npm run lint
	@echo "Linting backend..."
	cd backend && source venv/bin/activate && flake8 .

format: ## Format code
	@echo "Formatting frontend..."
	cd frontend && npm run format
	@echo "Formatting backend..."
	cd backend && source venv/bin/activate && black .

test: ## Run tests
	@echo "Testing frontend..."
	cd frontend && npm test
	@echo "Testing backend..."
	cd backend && source venv/bin/activate && pytest

clean: ## Clean build artifacts and dependencies
	@echo "Cleaning frontend..."
	cd frontend && rm -rf .next node_modules
	@echo "Cleaning backend..."
	cd backend && rm -rf __pycache__ .pytest_cache venv
	@echo "Clean complete!"

init-db: ## Initialize database (Docker must be running)
	docker-compose exec postgres psql -U datapilot_user -d datapilot_db -f /docker-entrypoint-initdb.d/01-init.sql
