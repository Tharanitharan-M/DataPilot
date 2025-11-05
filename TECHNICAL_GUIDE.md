# DataPilot Technical Guide: Complete Explanation of All Changes

> **Purpose**: This document explains every file I created or modified, the reasoning behind each decision, how components interact, and the overall architecture. Think of this as your comprehensive learning guide.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Backend Components](#backend-components)
3. [Frontend Components](#frontend-components)
4. [Docker & Infrastructure](#docker--infrastructure)
5. [Development Tools](#development-tools)
6. [Communication Flow](#communication-flow)

---

## Architecture Overview

### The Big Picture

DataPilot follows a **monorepo architecture** with clear separation of concerns:

```
Frontend (Next.js/React) ←→ Backend (FastAPI/Python) ←→ Database (PostgreSQL)
                                      ↓
                                  Redis Cache
```

**Why this architecture?**

- **Monorepo**: All code in one repository makes it easier to share code, manage dependencies, and deploy
- **Separation**: Frontend and backend are independent, allowing different teams to work simultaneously
- **Caching**: Redis speeds up repeated queries and reduces database load
- **Type Safety**: TypeScript (frontend) + Python type hints (backend) catch errors early

---

## Backend Components

### 1. `backend/requirements.txt`

**What I Added:**

```txt
fastapi==0.121.0          # Web framework
uvicorn[standard]==0.38.0 # ASGI server
pydantic==2.12.4          # Data validation
psycopg2-binary==2.9.10   # PostgreSQL driver
sqlalchemy==2.0.36        # ORM (Object-Relational Mapping)
alembic==1.14.0           # Database migrations
redis==5.2.1              # Cache client
python-jose[cryptography] # JWT tokens
passlib[bcrypt]           # Password hashing
pytest==8.3.4             # Testing framework
black==24.10.0            # Code formatter
```

**Why Each Dependency?**

1. **FastAPI**: Modern, fast web framework with automatic API documentation

   - Built-in request/response validation
   - Async support for better performance
   - Auto-generates OpenAPI (Swagger) docs

2. **Uvicorn**: ASGI server to run FastAPI

   - ASGI = Async Server Gateway Interface
   - Handles incoming HTTP requests
   - Supports WebSockets

3. **Pydantic**: Data validation using Python type hints

   - Validates incoming request data
   - Converts data types automatically
   - Provides clear error messages

4. **psycopg2-binary**: PostgreSQL adapter for Python

   - Connects Python code to PostgreSQL database
   - Executes SQL queries
   - Binary version = easier installation (no compilation needed)

5. **SQLAlchemy**: ORM (Object-Relational Mapper)

   - Write Python classes instead of SQL
   - Type-safe database queries
   - Handles relationships between tables

6. **Alembic**: Database migration tool

   - Tracks changes to database schema
   - Version control for your database structure
   - Allows rollback of database changes

7. **Redis**: In-memory data store for caching

   - Super fast (data stored in RAM)
   - Reduces database load
   - Good for session storage, rate limiting

8. **python-jose**: JWT (JSON Web Token) implementation

   - Creates secure authentication tokens
   - Tokens contain user information
   - No need to store sessions on server

9. **passlib + bcrypt**: Password hashing

   - NEVER store passwords in plain text
   - Bcrypt is slow on purpose (prevents brute force)
   - One-way encryption (can't reverse it)

10. **pytest**: Testing framework
    - Write automated tests
    - Catch bugs before production
    - Async test support

---

### 2. `backend/main.py` - Application Entry Point

**What I Changed:**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import api_router
from app.utils.logger import logger
```

**Line-by-Line Explanation:**

```python
app = FastAPI(
    title=settings.APP_NAME,        # Shows in API docs
    version=settings.APP_VERSION,    # API version
    debug=settings.DEBUG,            # Show detailed errors
    docs_url="/api/docs",           # Swagger UI location
    redoc_url="/api/redoc",         # Alternative docs
    openapi_url="/api/openapi.json" # OpenAPI schema
)
```

**Why these settings?**

- `docs_url`: Automatic interactive API documentation (try http://localhost:8000/api/docs)
- `debug=True`: In development, shows full error traces
- `openapi_url`: Schema for frontend code generation

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,  # Which domains can call API
    allow_credentials=True,                     # Allow cookies
    allow_methods=["*"],                        # Allow all HTTP methods
    allow_headers=["*"],                        # Allow all headers
)
```

**Why CORS?**

- **CORS = Cross-Origin Resource Sharing**
- Browser security prevents websites from calling APIs on different domains
- Frontend runs on `localhost:3000`, backend on `localhost:8000` = different origins
- We explicitly allow this communication

```python
@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting {settings.APP_NAME}")
```

**Why startup/shutdown events?**

- Run code when application starts (connect to database, warm up cache)
- Run code when application stops (close connections, cleanup)
- Good for initialization and resource management

```python
@app.get("/health")
async def health_check():
    return {"status": "healthy", ...}
```

**Why health check endpoint?**

- Monitoring tools ping this to verify server is running
- Docker uses it to know when container is ready
- Load balancers use it to route traffic

```python
app.include_router(api_router, prefix="/api/v1")
```

**Why API versioning?**

- `/api/v1/users` vs `/api/v2/users`
- Can release v2 without breaking v1 clients
- Gradual migration for users

---

### 3. `backend/app/core/config.py` - Configuration Management

**What I Created:**

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "DataPilot"
    DEBUG: bool = True
    DATABASE_URL: str = "postgresql://..."

    class Config:
        env_file = ".env"
        case_sensitive = True
```

**Why Pydantic Settings?**

1. **Type Safety**: If you set `PORT = "abc"`, it will error (expects int)
2. **Auto-loading**: Reads from `.env` file automatically
3. **Validation**: Ensures all required settings are present
4. **Defaults**: Provides sensible defaults for development

**Example Flow:**

```
1. App starts
2. Pydantic reads .env file
3. Converts string "8000" to integer 8000
4. Validates DATABASE_URL format
5. Creates settings object
6. Import settings anywhere: from app.core.config import settings
```

**Properties Explained:**

```python
@property
def cors_origins_list(self) -> List[str]:
    return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
```

**Why?**

- `.env` file has: `CORS_ORIGINS=http://localhost:3000,http://localhost:3001`
- This property converts it to: `["http://localhost:3000", "http://localhost:3001"]`
- Code can use: `settings.cors_origins_list`

---

### 4. `backend/app/core/security.py` - Authentication & Security

**What I Created:**

```python
from passlib.context import CryptContext
from jose import jwt

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
```

**Password Hashing Explained:**

```python
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)
```

**How it works:**

1. User registers with password "mypassword123"
2. `hash("mypassword123")` → `$2b$12$KIXxFz...` (60 characters)
3. Store hashed version in database
4. Can't reverse the hash to get original password
5. Same password hashed twice = different results (bcrypt adds random "salt")

```python
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
```

**Login flow:**

1. User submits password "mypassword123"
2. Fetch user's hashed password from database: `$2b$12$KIXxFz...`
3. `verify("mypassword123", "$2b$12$KIXxFz...")` → Returns `True` or `False`
4. Bcrypt internally hashes the plain password and compares

**JWT Token Creation:**

```python
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=30)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt
```

**JWT Explained:**

1. **Input**: `{"user_id": 123, "email": "user@example.com"}`
2. **Add expiry**: `{"user_id": 123, "email": "...", "exp": 1234567890}`
3. **Encode**: Creates string like `eyJhbGciOiJIUzI1NiIs...`
4. **Sign**: Uses SECRET_KEY so no one can fake tokens
5. **Send to client**: Client stores in localStorage or cookie

**JWT Structure:**

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxMjN9.signature
       HEADER                    .     PAYLOAD        . SIGNATURE
```

- **Header**: Algorithm used (HS256)
- **Payload**: Your data (user_id, email, etc.)
- **Signature**: Proves token wasn't tampered with

**Why JWT?**

- Stateless: Server doesn't need to store sessions
- Scalable: Any server can verify token (no shared session store)
- Mobile-friendly: Works for web, mobile, desktop apps

---

### 5. `backend/app/db/session.py` - Database Connection

**What I Created:**

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # Test connection before using
    echo=settings.DEBUG   # Log all SQL queries
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

**How Database Connections Work:**

1. **Engine**: The connection manager

   - Maintains pool of connections (reuses them)
   - Handles connection failures
   - Translates Python to SQL

2. **SessionLocal**: Factory for creating sessions

   - Session = conversation with database
   - Each request gets its own session
   - Session tracks changes and commits them

3. **pool_pre_ping**: Before using connection, pings database
   - If database restarted, detects dead connection
   - Creates new connection automatically
   - Prevents "connection lost" errors

**Dependency Injection:**

```python
def get_db():
    db = SessionLocal()
    try:
        yield db  # Give session to route handler
    finally:
        db.close()  # Always close, even if error
```

**Usage in routes:**

```python
@app.get("/users/")
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users
```

**Flow:**

1. Request comes in
2. FastAPI calls `get_db()`
3. Creates new database session
4. Passes session to route handler
5. Handler uses session to query
6. Response sent
7. `finally` block closes session
8. Connection returned to pool

**Why this pattern?**

- Each request gets fresh session
- Sessions always cleaned up (no memory leaks)
- Easy to mock for testing
- FastAPI handles it automatically

---

### 6. `backend/app/db/redis_client.py` - Caching

**What I Created:**

```python
import redis

redis_client = redis.from_url(
    settings.REDIS_URL,
    decode_responses=True  # Return strings, not bytes
)

def cache_set(key: str, value: str, expire: int = 3600):
    return redis_client.setex(key, expire, value)
```

**Caching Explained:**

**Example - Without Cache:**

```python
@app.get("/users/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    return user
```

- Every request queries database
- Database does disk I/O (slow)
- 1000 requests = 1000 database queries

**Example - With Cache:**

```python
@app.get("/users/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    # Check cache first
    cached = cache_get(f"user:{user_id}")
    if cached:
        return json.loads(cached)  # Return from RAM (fast!)

    # Not in cache, query database
    user = db.query(User).filter(User.id == user_id).first()

    # Store in cache for 1 hour
    cache_set(f"user:{user_id}", json.dumps(user), expire=3600)

    return user
```

**Benefits:**

- First request: Queries database, stores in Redis
- Next 999 requests: Served from Redis (RAM)
- Redis response time: ~1ms
- Database query time: ~50-200ms
- 50-200x faster!

**When to Use Cache:**

- Data that doesn't change often (user profiles, settings)
- Expensive calculations
- API responses from external services
- Rate limiting (count API calls per user)

**Cache Invalidation:**

```python
@app.put("/users/{user_id}")
def update_user(user_id: int, user_data: UserUpdate, db: Session = Depends(get_db)):
    # Update database
    db.query(User).filter(User.id == user_id).update(user_data.dict())
    db.commit()

    # Delete old cached data
    cache_delete(f"user:{user_id}")

    return {"status": "updated"}
```

---

### 7. `backend/app/utils/logger.py` - Logging

**What I Created:**

```python
import logging

logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger("datapilot")
```

**Log Levels Explained:**

```python
logger.debug("User query: SELECT * FROM users")  # Detailed info for debugging
logger.info("User 123 logged in")                 # General information
logger.warning("Rate limit approaching")          # Warning, but app works
logger.error("Database connection failed")        # Error occurred
logger.critical("Server out of memory!")          # Critical issue
```

**When DEBUG=True**: Shows all levels (debug, info, warning, error, critical)
**When DEBUG=False** (production): Shows only info, warning, error, critical

**Why Logging?**

- Debugging: Trace what code is doing
- Monitoring: Track application health
- Auditing: Who did what and when
- Performance: Find slow operations

**Example Usage:**

```python
@app.post("/login")
def login(credentials: LoginData):
    logger.info(f"Login attempt for email: {credentials.email}")

    user = authenticate(credentials)
    if user:
        logger.info(f"Login successful for user {user.id}")
        return {"token": create_token(user)}
    else:
        logger.warning(f"Failed login attempt for {credentials.email}")
        raise HTTPException(status_code=401, detail="Invalid credentials")
```

**Log Format:**

```
2025-11-05 10:30:45 - datapilot - INFO - Login successful for user 123
    DATE/TIME         APP-NAME    LEVEL        MESSAGE
```

---

## Frontend Components

### 8. `frontend/package.json` - Dependencies

**What I Added:**

```json
{
  "dependencies": {
    "class-variance-authority": "^0.7.1", // Component variants
    "clsx": "^2.1.1", // Conditional classes
    "tailwind-merge": "^2.7.0", // Merge Tailwind classes
    "lucide-react": "^0.469.0" // Icon library
  },
  "devDependencies": {
    "prettier": "^3.4.2", // Code formatter
    "prettier-plugin-tailwindcss": "^0.6.10" // Sort Tailwind classes
  }
}
```

**Why Each Dependency?**

**1. class-variance-authority (CVA):**
Creates component variants elegantly.

```typescript
// Without CVA (messy)
<button className={`
  px-4 py-2 rounded
  ${variant === 'primary' ? 'bg-blue-500 text-white' : ''}
  ${variant === 'secondary' ? 'bg-gray-500 text-white' : ''}
  ${size === 'sm' ? 'text-sm' : ''}
  ${size === 'lg' ? 'text-lg' : ''}
`}>

// With CVA (clean)
const buttonVariants = cva("px-4 py-2 rounded", {
  variants: {
    variant: {
      primary: "bg-blue-500 text-white",
      secondary: "bg-gray-500 text-white",
    },
    size: {
      sm: "text-sm",
      lg: "text-lg",
    }
  }
})

<button className={buttonVariants({ variant: "primary", size: "lg" })}>
```

**2. clsx + tailwind-merge:**

```typescript
// Problem: Conflicting Tailwind classes
<div className="p-4 p-2"> // Which padding wins?

// Solution:
import { cn } from "@/lib/utils"

cn("p-4 text-red-500", "p-2 text-blue-500")
// Result: "p-2 text-blue-500" (later classes override)
```

**3. lucide-react:**
Modern icon library (alternative to Font Awesome)

```typescript
import { User, Settings, LogOut } from "lucide-react"

<User className="w-6 h-6" />
<Settings className="w-6 h-6" />
```

**Benefits:**

- Tree-shaking (only icons you use are included)
- TypeScript support
- Consistent sizing
- Over 1000 icons

**4. Prettier:**
Automatic code formatting

```typescript
// Before Prettier (inconsistent)
function hello(name: string) {
  return "Hello " + name;
}

// After Prettier (consistent)
function hello(name: string) {
  return "Hello " + name;
}
```

Runs on save, ensures team has same code style.

---

### 9. `frontend/src/lib/utils.ts` - Utility Functions

**What I Created:**

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Deep Dive - How `cn()` Works:**

**Step 1 - clsx:** Combines class names conditionally

```typescript
clsx("p-4", "text-red-500"); // "p-4 text-red-500"
clsx("p-4", false && "hidden"); // "p-4"
clsx("p-4", true && "hidden"); // "p-4 hidden"
clsx({ "text-red": true, "text-blue": false }); // "text-red"
```

**Step 2 - twMerge:** Resolves Tailwind conflicts

```typescript
twMerge("p-4 p-2"); // "p-2" (keeps last)
twMerge("text-red-500 text-blue-500"); // "text-blue-500"
twMerge("px-4 p-2"); // "p-2" (p-2 includes px, so it wins)
```

**Real-World Example:**

```typescript
// Button component with defaults that can be overridden
interface ButtonProps {
  className?: string;
  variant?: "primary" | "secondary";
}

function Button({ className, variant }: ButtonProps) {
  return (
    <button
      className={cn(
        "px-4 py-2 rounded font-medium",  // Defaults
        variant === "primary" && "bg-blue-500 text-white",
        variant === "secondary" && "bg-gray-500 text-white",
        className  // User can override anything
      )}
    >
```

Usage:

```typescript
<Button variant="primary" className="px-8" />
// Result: "py-2 rounded font-medium bg-blue-500 text-white px-8"
// Note: User's px-8 overrides default px-4
```

---

### 10. `frontend/tsconfig.json` - TypeScript Configuration

**What I Modified:**

```json
{
  "compilerOptions": {
    "strict": true, // Enable all strict type checks
    "noUnusedLocals": true, // Error on unused variables
    "noUnusedParameters": true, // Error on unused function params
    "noFallthroughCasesInSwitch": true, // Catch switch statement bugs

    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"] // Import aliases
    }
  }
}
```

**Why Strict Mode?**

**Without strict:**

```typescript
let user: any = { name: "John" };
user.age.toFixed(2); // Runtime error! age doesn't exist
```

**With strict:**

```typescript
let user: any = { name: "John" };
user.age.toFixed(2); // TypeScript error: Property 'age' does not exist
```

**Path Aliases:**

**Without alias:**

```typescript
import { Button } from "../../../components/ui/Button";
```

**With alias:**

```typescript
import { Button } from "@/components/ui/Button";
```

Always starts from `src/`, no matter how deep your file is.

---

### 11. `frontend/components.json` - shadcn/ui Config

**What I Created:**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

**What is shadcn/ui?**

Not a component library you install - it's a **collection of copy-paste components**.

**Traditional component library (Material-UI, Ant Design):**

```bash
npm install @mui/material
import { Button } from '@mui/material'
```

- Stuck with their implementation
- Can't easily customize
- Large bundle size

**shadcn/ui approach:**

```bash
npx shadcn@latest add button
```

- Copies `button.tsx` to your project
- You own the code
- Customize however you want
- Uses Tailwind CSS
- TypeScript + React

**Example - Adding a button:**

```bash
npx shadcn@latest add button
```

Creates `frontend/src/components/ui/button.tsx`:

```typescript
import { cva } from "class-variance-authority";

const buttonVariants = cva("px-4 py-2 rounded", {
  variants: {
    variant: {
      default: "bg-primary text-white",
      outline: "border border-input",
    },
  },
});

export function Button({ variant, ...props }) {
  return <button className={buttonVariants({ variant })} {...props} />;
}
```

Now you can modify this file directly!

---

## Docker & Infrastructure

### 12. `docker-compose.yml` - Development Environment

**What I Created:**

```yaml
version: "3.8"

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: datapilot_user
      POSTGRES_PASSWORD: datapilot_password
      POSTGRES_DB: datapilot_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U datapilot_user"]
      interval: 10s
      timeout: 5s
      retries: 5
```

**Line-by-Line Explanation:**

**Image:**

```yaml
image: postgres:16-alpine
```

- `postgres:16` = PostgreSQL version 16
- `alpine` = Lightweight Linux (5MB vs 100MB+)
- Faster downloads, less disk space

**Environment Variables:**

```yaml
environment:
  POSTGRES_USER: datapilot_user
  POSTGRES_PASSWORD: datapilot_password
  POSTGRES_DB: datapilot_db
```

- Creates database user on first start
- Sets password
- Creates initial database

**Ports:**

```yaml
ports:
  - "5432:5432"
```

- Format: `"HOST:CONTAINER"`
- Exposes container's port 5432 to your computer's port 5432
- Can connect from your computer: `localhost:5432`

**Volumes:**

```yaml
volumes:
  - postgres_data:/var/lib/postgresql/data
```

- **Problem**: If container stops, data is lost
- **Solution**: Store data in Docker volume
- Volume persists even when container is deleted
- Like an external hard drive for your container

**Health Check:**

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U datapilot_user"]
  interval: 10s
  timeout: 5s
  retries: 5
```

- Every 10 seconds, runs `pg_isready` command
- Checks if PostgreSQL is accepting connections
- If fails 5 times, marks container as unhealthy
- Other services wait until healthy before starting

**depends_on with condition:**

```yaml
backend:
  depends_on:
    postgres:
      condition: service_healthy
```

- Backend waits for PostgreSQL to be healthy
- Prevents "connection refused" errors on startup
- Backend starts only when database is ready

**Redis Service:**

```yaml
redis:
  image: redis:7-alpine
  command: redis-server --appendonly yes
```

- `--appendonly yes`: Persist data to disk
- Without it, Redis data is lost on restart
- Writes every change to file (slower but safer)

**Backend Service:**

```yaml
backend:
  build:
    context: ./backend
    dockerfile: Dockerfile
  volumes:
    - ./backend:/app
    - /app/venv
  command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Volumes Explained:**

- `./backend:/app`: Mounts your code into container
- Changes to code on your computer → immediately reflected in container
- `/app/venv`: Anonymous volume for dependencies
- Why? Prevents overwriting container's installed packages

**Command:**

- `--host 0.0.0.0`: Listen on all network interfaces
- `--port 8000`: Use port 8000
- `--reload`: Auto-restart when code changes (development only!)

**Network:**

```yaml
networks:
  datapilot_network:
    driver: bridge
```

- All services on same network can talk to each other
- Backend can reach database at hostname `postgres`
- Frontend can reach backend at hostname `backend`
- Isolated from other Docker networks

**Communication Example:**

```python
# In backend code, use service name as hostname
DATABASE_URL = "postgresql://user:pass@postgres:5432/db"
#                                      ^^^^^^^^
#                                      Service name from docker-compose.yml
```

---

### 13. `infrastructure/init-scripts/01-init.sql` - Database Setup

**What I Created:**

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

**Why UUID Extension?**

- Generates unique IDs: `550e8400-e29b-41d4-a716-446655440000`
- Better than auto-increment IDs for distributed systems
- Can generate IDs before inserting (no need to wait for database)
- Hard to guess (security)

```sql
CREATE SCHEMA IF NOT EXISTS datapilot;
```

**Why Schemas?**

- Organizes tables into namespaces
- Like folders for your database
- `datapilot.users` vs `public.users`
- Helpful for multi-tenant apps

```sql
GRANT ALL PRIVILEGES ON DATABASE datapilot_db TO datapilot_user;
```

**Permissions:**

- datapilot_user can create/read/update/delete
- If you had a read-only user, give only SELECT permission
- Production: Use least privilege (only needed permissions)

**How This Runs:**

1. First time Docker container starts
2. PostgreSQL looks in `/docker-entrypoint-initdb.d/`
3. Runs all `.sql` and `.sh` files alphabetically
4. `01-init.sql` runs first (if you add `02-seed.sql`, it runs second)
5. Never runs again (only on first start)

---

### 14. Backend Dockerfiles

**`backend/Dockerfile`:**

```dockerfile
FROM python:3.13-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Line-by-Line:**

**Base Image:**

```dockerfile
FROM python:3.13-slim
```

- Official Python image
- `slim` = smaller (no unnecessary tools)
- 150MB vs 1GB for full image

**Working Directory:**

```dockerfile
WORKDIR /app
```

- All subsequent commands run in `/app`
- Like `cd /app`

**System Dependencies:**

```dockerfile
RUN apt-get update && apt-get install -y gcc postgresql-client
```

- `gcc`: C compiler (needed for some Python packages)
- `postgresql-client`: Tools to connect to PostgreSQL
- `&& rm -rf /var/lib/apt/lists/*`: Delete package cache (save space)

**Copy and Install:**

```dockerfile
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
```

- Copy `requirements.txt` first (Docker caching!)
- If requirements don't change, Docker reuses cached layer
- Install packages
- `--no-cache-dir`: Don't save pip cache (save space)

**Why copy requirements before code?**

```dockerfile
# If we did this:
COPY . .
RUN pip install -r requirements.txt

# Every code change = reinstall all packages (slow!)

# Our way:
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .

# Packages reinstall only if requirements.txt changes!
```

**Expose Port:**

```dockerfile
EXPOSE 8000
```

- Documentation (doesn't actually open port)
- Tells others which port the app uses
- `docker-compose.yml` still needs `ports:` to actually expose

**`.dockerignore`:**

```
venv/
__pycache__/
*.pyc
.env
```

- Like `.gitignore` for Docker
- Don't copy these files into container
- Faster builds
- Smaller images
- Don't leak secrets (`.env`)

---

### 15. Frontend Dockerfile

**`frontend/Dockerfile`:**

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

**Why node:20-alpine?**

- Node.js version 20 (LTS)
- Alpine Linux (tiny, 40MB base)
- Perfect for development

**Copy package files first:**

```dockerfile
COPY package*.json ./
RUN npm install
```

- `package*.json` copies both `package.json` and `package-lock.json`
- Docker caches `npm install` layer
- Only re-installs if package files change

**Development vs Production:**

**Development (current):**

```dockerfile
CMD ["npm", "run", "dev"]
```

- Hot reload
- Source maps
- Detailed errors

**Production (would be):**

```dockerfile
RUN npm run build
CMD ["npm", "start"]
```

- Optimized bundle
- No source maps
- Smaller size
- Faster loading

---

## Development Tools

### 16. `package.json` (Root) - Monorepo Scripts

**What I Created:**

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:backend\"",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "lint": "npm run lint:frontend && npm run lint:backend"
  }
}
```

**Concurrently:**

```bash
npm run dev
```

Runs both:

- Frontend dev server (`npm run dev:frontend`)
- Backend dev server (`npm run dev:backend`)

In parallel, in same terminal window!

**Alternative without concurrently:**

```bash
# Terminal 1
cd frontend && npm run dev

# Terminal 2
cd backend && uvicorn main:app --reload
```

Two terminals required - annoying!

**Docker Scripts:**

- `-d` flag = detached (run in background)
- Without `-d`, terminal stays attached to logs

---

### 17. `Makefile` - Convenient Commands

**What I Created:**

```makefile
.PHONY: docker-up
docker-up: ## Start Docker services
	docker-compose up -d

.PHONY: lint
lint: ## Run linters
	cd frontend && npm run lint
	cd backend && source venv/bin/activate && flake8 .
```

**Why Makefiles?**

Instead of:

```bash
cd frontend && npm run lint && cd ../backend && source venv/bin/activate && flake8 .
```

Just:

```bash
make lint
```

**PHONY Explained:**

```makefile
.PHONY: lint
```

- Tells Make that `lint` is not a file
- Make won't look for a file named "lint"
- Always runs the command

**Help Command:**

```makefile
help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
	awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'
```

Parses Makefile and shows all commands with `##` comments:

```bash
$ make help
  docker-up       Start Docker services
  lint            Run linters
  test            Run tests
```

---

### 18. `.editorconfig` - Editor Consistency

**What I Created:**

```ini
[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true

[*.py]
indent_style = space
indent_size = 4

[*.{js,ts,tsx}]
indent_style = space
indent_size = 2
```

**Why This Matters:**

**Problem:**

- Developer A uses tabs, Developer B uses spaces
- Code looks messy
- Git diffs show whitespace changes
- Merge conflicts

**Solution:**

- EditorConfig file
- Editor reads it automatically (VSCode, Vim, Sublime)
- Everyone has same settings
- Consistent formatting

**Settings Explained:**

- `end_of_line = lf`: Unix line endings (not Windows `\r\n`)
- `insert_final_newline = true`: Blank line at end of file
- `indent_size = 4`: Python uses 4 spaces (PEP 8)
- `indent_size = 2`: JavaScript/TypeScript uses 2 spaces (common practice)

---

### 19. `.prettierrc` - Code Formatting

**What I Created:**

```json
{
  "semi": true, // Use semicolons
  "trailingComma": "es5", // Commas in objects/arrays
  "singleQuote": false, // Use double quotes
  "printWidth": 100, // Max line length
  "tabWidth": 2, // 2 spaces per tab
  "arrowParens": "always" // (x) => x, not x => x
}
```

**Example:**

**Before Prettier:**

```typescript
function hello(name: string) {
  return "Hello " + name;
}
const obj = {
  a: 1,
  b: 2,
  c: 3,
  d: 4,
  e: 5,
  f: 6,
  g: 7,
  h: 8,
  i: 9,
  j: 10,
  k: 11,
};
```

**After Prettier:**

```typescript
function hello(name: string) {
  return "Hello " + name;
}

const obj = {
  a: 1,
  b: 2,
  c: 3,
  d: 4,
  e: 5,
  f: 6,
  g: 7,
  h: 8,
  i: 9,
  j: 10,
  k: 11,
};
```

**Prettier Plugin for Tailwind:**

```json
"plugins": ["prettier-plugin-tailwindcss"]
```

Sorts Tailwind classes in recommended order:

```typescript
// Before
<div className="text-blue-500 p-4 hover:bg-blue-600 flex">

// After (sorted)
<div className="flex p-4 text-blue-500 hover:bg-blue-600">
```

Follows Tailwind's official class order: layout → spacing → typography → colors → effects

---

### 20. `.vscode/settings.json` - VSCode Configuration

**What I Created:**

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "[python]": {
    "editor.defaultFormatter": "ms-python.black-formatter"
  }
}
```

**Format on Save:**

- Every time you press Ctrl+S / Cmd+S
- Prettier automatically formats the file
- No need to run `npm run format`

**Code Actions on Save:**

- `fixAll.eslint`: Auto-fixes ESLint errors
- `organizeImports`: Sorts and removes unused imports

**Before:**

```typescript
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Card } from "@/components/ui/card";
```

**After (on save):**

```typescript
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
```

**Python Formatter:**

```json
"[python]": {
  "editor.defaultFormatter": "ms-python.black-formatter"
}
```

- Uses Black for Python files
- Opinionated (no configuration needed)
- Industry standard

---

### 21. Python Code Quality Tools

**`.flake8` Configuration:**

```ini
[flake8]
max-line-length = 100
exclude = venv, __pycache__
ignore = E203, W503
```

**What Flake8 Checks:**

```python
# E501: Line too long
def my_function_with_a_very_long_name_that_exceeds_the_maximum_line_length():
    pass

# E302: Expected 2 blank lines
class MyClass:
    pass
def my_function():  # Error! Need blank line before function
    pass

# F401: Imported but unused
import os  # Error if you don't use 'os'

# W291: Trailing whitespace
def hello():    # Error! Spaces at end of line
    pass
```

**Why ignore E203 and W503?**

- Conflicts with Black formatter
- Black's style is more modern
- Let Black handle it

**pyproject.toml - Black Config:**

```toml
[tool.black]
line-length = 100
target-version = ['py313']
```

**What Black Does:**

```python
# Before Black
def hello( name:str )->str:
    return"Hello "+name

# After Black
def hello(name: str) -> str:
    return "Hello " + name
```

**Why Black?**

- Uncompromising (no config debates)
- Consistent across all Python projects
- Fast
- Used by Django, pytest, requests, etc.

---

### 22. `.env.example` Files - Environment Templates

**Backend `.env.example`:**

```bash
# Application
APP_NAME=DataPilot
DEBUG=True

# Database
DATABASE_URL=postgresql://datapilot_user:datapilot_password@localhost:5432/datapilot_db

# Redis
REDIS_URL=redis://localhost:6379/0

# Security
SECRET_KEY=your-secret-key-change-this-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=http://localhost:3000
```

**Why `.env.example` not `.env`?**

1. **`.env`** = Your actual secrets (in `.gitignore`)
2. **`.env.example`** = Template for others (in Git)

**Workflow:**

```bash
# New developer joins team
git clone repo
cp backend/.env.example backend/.env
# Edit .env with their values
```

**Environment Variables Explained:**

**DATABASE_URL Format:**

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE
   PROTOCOL    CREDENTIALS    LOCATION   DB-NAME
```

**Why SECRET_KEY is important:**

```python
# JWT token signed with SECRET_KEY
token = jwt.encode({"user_id": 123}, SECRET_KEY, algorithm="HS256")

# If attacker knows your SECRET_KEY:
fake_token = jwt.encode({"user_id": 999}, SECRET_KEY, algorithm="HS256")
# They can impersonate any user!

# Solution: Long random key
import secrets
print(secrets.token_urlsafe(32))
# Output: "dF3pQ9kL2mN5oP7rS8tU1vW4xY6zA0bC2dE4fG6hJ8kL"
```

**Frontend `.env.example`:**

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_SECRET=your-nextauth-secret
```

**Why `NEXT_PUBLIC_` prefix?**

- Next.js security feature
- Variables **without** prefix = server-side only
- Variables **with** `NEXT_PUBLIC_` = exposed to browser

```typescript
// Server-side only (secure)
const SECRET = process.env.SECRET_KEY;

// Browser can see (public)
const API_URL = process.env.NEXT_PUBLIC_API_URL;
```

**Never expose secrets:**

```bash
# DON'T DO THIS:
NEXT_PUBLIC_DATABASE_URL=postgresql://...
NEXT_PUBLIC_SECRET_KEY=...

# Anyone can view source and see these!
```

---

## Communication Flow

### How Everything Connects

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Browser   │────────▶│   Next.js   │────────▶│   FastAPI   │
│             │◀────────│  Frontend   │◀────────│   Backend   │
└─────────────┘         └─────────────┘         └─────────────┘
                             │                         │
                             │                         ▼
                             │                   ┌─────────────┐
                             │                   │  PostgreSQL │
                             │                   │  Database   │
                             │                   └─────────────┘
                             │                         │
                             │                         ▼
                             │                   ┌─────────────┐
                             │                   │    Redis    │
                             │                   │    Cache    │
                             │                   └─────────────┘
                             │
                             ▼
                        (Static Assets)
```

### Request Flow Example

**User clicks "Login" button:**

```typescript
// 1. Frontend (React Component)
function LoginForm() {
  const handleSubmit = async (email, password) => {
    // 2. API call to backend
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await response.json();
    // 3. Store token
    localStorage.setItem("token", data.access_token);
  };
}
```

```python
# 4. Backend receives request
@app.post("/api/v1/login")
async def login(credentials: LoginData, db: Session = Depends(get_db)):
    # 5. Query database
    user = db.query(User).filter(User.email == credentials.email).first()

    # 6. Check password
    if not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # 7. Create JWT token
    token = create_access_token({"user_id": user.id, "email": user.email})

    # 8. Return token
    return {"access_token": token, "token_type": "bearer"}
```

**Subsequent requests with token:**

```typescript
// Frontend includes token in headers
const response = await fetch(`${API_URL}/api/v1/users/me`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

```python
# Backend verifies token
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer

security = HTTPBearer()

async def get_current_user(token: str = Depends(security)):
    # Decode JWT token
    payload = decode_access_token(token.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    return payload["user_id"]

@app.get("/api/v1/users/me")
async def get_me(user_id: int = Depends(get_current_user)):
    # user_id extracted from token
    return {"user_id": user_id}
```

### Caching Flow

```python
@app.get("/api/v1/products")
async def get_products():
    # 1. Check cache first
    cached = cache_get("products:all")
    if cached:
        logger.info("Cache hit")
        return json.loads(cached)

    # 2. Cache miss, query database
    logger.info("Cache miss, querying database")
    products = db.query(Product).all()

    # 3. Store in cache for 5 minutes
    cache_set("products:all", json.dumps(products), expire=300)

    return products
```

**Timing:**

- First request: 200ms (database query)
- Next requests: 2ms (Redis cache)
- After 5 minutes: Cache expires, queries database again

---

## Summary of Changes

### Files Created (30+ files):

**Backend:**

- `requirements.txt` - Python dependencies
- `Dockerfile` - Container definition
- `.dockerignore` - Ignore files in container
- `.env.example` - Environment template
- `.flake8` - Linter config
- `pyproject.toml` - Black & MyPy config
- `pytest.ini` - Test config
- `app/core/config.py` - Settings management
- `app/core/security.py` - JWT & password hashing
- `app/db/session.py` - Database connection
- `app/db/redis_client.py` - Redis connection
- `app/utils/logger.py` - Logging setup
- `app/utils/helpers.py` - Utility functions
- Plus `__init__.py` files for all modules

**Frontend:**

- `Dockerfile` - Container definition
- `.dockerignore` - Ignore files
- `.env.example` - Environment template
- `.prettierrc` - Code formatting
- `.prettierignore` - Ignore files
- `components.json` - shadcn/ui config
- `src/lib/utils.ts` - Utility functions

**Infrastructure:**

- `docker-compose.yml` - Multi-container setup
- `infrastructure/init-scripts/01-init.sql` - Database init

**Root:**

- `package.json` - Monorepo scripts
- `Makefile` - Convenience commands
- `.editorconfig` - Editor consistency
- `.vscode/settings.json` - VSCode config
- `.vscode/extensions.json` - Recommended extensions
- `.cursorignore` - Cursor AI ignore
- `README.md` - Documentation
- `QUICKSTART.md` - Quick start guide
- `CONTRIBUTING.md` - Contribution guide
- `SETUP_COMPLETE.md` - Setup summary
- `shared/README.md` - Shared code docs

### Files Modified:

- `backend/main.py` - Enhanced with CORS, logging, health checks
- `frontend/package.json` - Added dependencies and scripts
- `frontend/tsconfig.json` - Strict mode and path aliases
- `.gitignore` - Comprehensive ignore rules

---

## Key Concepts Recap

### 1. **Dependency Injection** (FastAPI)

```python
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/users/")
def get_users(db: Session = Depends(get_db)):
    # FastAPI automatically calls get_db() and passes result
    users = db.query(User).all()
    return users
```

### 2. **JWT Authentication**

```
Login → Backend creates JWT → Frontend stores JWT
↓
User makes request with JWT in header
↓
Backend verifies JWT signature
↓
Extract user info from JWT payload
↓
Process request
```

### 3. **Caching Strategy**

```
Request → Check Redis → Found? Return
                      → Not found? Query DB → Cache result → Return
```

### 4. **Docker Networking**

```
Frontend container ──┐
Backend container  ──┼─► datapilot_network
PostgreSQL        ──┤
Redis             ──┘

Services communicate using service names as hostnames
```

### 5. **Environment Configuration**

```
.env.example (template) → Copy to .env (your values) → Loaded by app
(in Git)                  (in .gitignore)              (at runtime)
```

---

## Next Steps for Learning

1. **Run the application**:

   ```bash
   npm run docker:up
   ```

2. **Explore API docs**: http://localhost:8000/api/docs

   - Try endpoints interactively
   - See request/response schemas

3. **Make changes**:

   - Add a new API endpoint
   - Create a React component
   - Query the database

4. **Debug**:

   - Check logs: `docker-compose logs -f backend`
   - Add print statements / logger.info()
   - Use VSCode debugger

5. **Read the code**:
   - Start from `backend/main.py`
   - Follow imports
   - Understand flow

---

## Questions to Explore

1. What happens if I change `backend/main.py`?

   - Docker volume mounts code
   - Uvicorn detects change
   - Auto-reloads server
   - Test immediately!

2. How do I add a database table?

   - Create model in `app/models/`
   - Create migration with Alembic
   - Apply migration
   - Use in API routes

3. How do I add a new API endpoint?

   - Create file in `app/api/routes/`
   - Define route with `@router.get()` or `@router.post()`
   - Include router in `app/api/routes/__init__.py`
   - Test in Swagger docs

4. How do I add a new page in Next.js?

   - Create file in `frontend/src/app/about/page.tsx`
   - Access at http://localhost:3000/about
   - Automatic routing!

5. How do I add shadcn/ui components?
   - `cd frontend`
   - `npx shadcn@latest add button`
   - Import: `import { Button } from "@/components/ui/button"`
   - Use: `<Button variant="primary">Click me</Button>`

---

## Conclusion

You now have a **production-ready foundation** with:

✅ **Type-safe backend** with FastAPI + Pydantic
✅ **Modern frontend** with Next.js + TypeScript
✅ **Database** with PostgreSQL + SQLAlchemy
✅ **Caching** with Redis
✅ **Authentication** ready (JWT infrastructure)
✅ **Development environment** with Docker
✅ **Code quality tools** (linting, formatting, testing)
✅ **Documentation** (API docs, README, this guide)

**Everything is connected and working together.** Each component has a specific purpose, and they communicate through well-defined interfaces.

Start building your features on this solid foundation! 🚀
