-- Initialize DataPilot Database
-- This script runs automatically when the database container starts

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create schema
CREATE SCHEMA IF NOT EXISTS datapilot;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE datapilot_db TO datapilot_user;
GRANT ALL PRIVILEGES ON SCHEMA datapilot TO datapilot_user;

-- Example: Create initial tables (can be removed if using Alembic)
-- CREATE TABLE IF NOT EXISTS users (
--     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--     email VARCHAR(255) UNIQUE NOT NULL,
--     username VARCHAR(100) UNIQUE NOT NULL,
--     hashed_password VARCHAR(255) NOT NULL,
--     is_active BOOLEAN DEFAULT TRUE,
--     is_superuser BOOLEAN DEFAULT FALSE,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

