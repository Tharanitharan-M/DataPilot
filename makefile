make run-frontend:
	cd frontend && npm run dev

make run-backend:
	cd backend && source venv/bin/activate && uvicorn main:app --reload --host 0.0.0.0 --port 8000