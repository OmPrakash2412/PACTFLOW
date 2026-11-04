# PACTFLOW Development & Operations Tools

## 1. Local Development Commands

### Backend (Python FastAPI)
```bash
# Run backend server
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Run comprehensive test suite (unit, integration, e2e)
python -m pytest tests -v
```

### Frontend (Next.js 14 App Router)
```bash
# Run frontend dev server
cd frontend
npm run dev

# Build production bundle
npm run build
```

## 2. Docker Compose
Run both services in containerized environments:
```bash
docker-compose up --build
```
- Backend: `http://localhost:8000` (Swagger docs at `/docs`)
- Frontend: `http://localhost:3000`

