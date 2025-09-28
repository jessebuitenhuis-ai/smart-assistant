-- Initial database setup for Smart Assistant
-- This script runs when the PostgreSQL container is first created

-- Create additional databases if needed
-- CREATE DATABASE smart_assistant_test;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Set timezone
SET timezone = 'UTC';

-- Create indexes for better performance (will be created by Prisma migrations)
-- These are just examples and will be handled by Prisma schema

COMMENT ON DATABASE smart_assistant IS 'Smart Assistant application database';
