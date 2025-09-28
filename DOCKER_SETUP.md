# Docker PostgreSQL Setup Guide

This guide explains how to set up and use PostgreSQL with Docker for the Smart Assistant project.

## Overview

The Docker setup includes:
- **PostgreSQL 16** (Alpine Linux) - Main database
- **pgAdmin 4** (Optional) - Web-based database administration tool
- **Persistent data storage** - Data survives container restarts
- **Health checks** - Ensures database is ready before dependent services start
- **Network isolation** - Services communicate through a dedicated Docker network

## Quick Start

### 1. Copy Environment Template
```bash
cp env.template .env
```

### 2. Start the Database
```bash
npm run docker:setup
```

This command will:
- Start the PostgreSQL container
- Run Prisma schema setup
- Generate the Prisma client

### 3. Verify Setup
```bash
npm run docker:logs
```

## Available Docker Scripts

### Basic Operations
```bash
# Start all services (PostgreSQL only)
npm run docker:up

# Start PostgreSQL only
npm run docker:db

# Stop all services
npm run docker:down

# Restart services
npm run docker:restart

# View logs
npm run docker:logs

# Complete setup (start + prisma setup)
npm run docker:setup
```

### Advanced Operations
```bash
# Start with pgAdmin (web interface)
npm run docker:pgadmin

# Stop and remove all data (DESTRUCTIVE)
npm run docker:clean

# Manual Docker Compose commands
docker-compose up -d postgres
docker-compose --profile admin up -d pgadmin
```

## Service Details

### PostgreSQL Container
- **Image**: postgres:16-alpine
- **Port**: 5432 (mapped to host)
- **Database**: smart_assistant
- **Username**: postgres
- **Password**: postgres
- **Container Name**: smart-assistant-postgres

### pgAdmin Container (Optional)
- **Image**: dpage/pgadmin4:latest
- **Port**: 5050 (mapped to host)
- **URL**: http://localhost:5050
- **Email**: admin@smart-assistant.local
- **Password**: admin
- **Container Name**: smart-assistant-pgadmin

## Database Configuration

### Connection String
```
postgresql://postgres:postgres@localhost:5432/smart_assistant?schema=public
```

### Environment Variables
Create a `.env` file with:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/smart_assistant?schema=public"
POSTGRES_DB=smart_assistant
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
```

## Data Persistence

### Volumes
- `postgres_data`: Stores PostgreSQL data files
- `pgadmin_data`: Stores pgAdmin configuration and settings

### Backup Data
```bash
# Create backup
docker exec smart-assistant-postgres pg_dump -U postgres smart_assistant > backup.sql

# Restore backup
docker exec -i smart-assistant-postgres psql -U postgres smart_assistant < backup.sql
```

## Development Workflow

### Initial Setup
1. Start Docker containers: `npm run docker:setup`
2. Verify connection: `npm run prisma:studio`
3. Begin development: `npm start`

### Daily Development
1. Start database: `npm run docker:db`
2. Run your application: `npm start`
3. Stop when done: `npm run docker:down`

### Schema Changes
1. Modify `prisma/schema.prisma`
2. Apply changes: `npm run prisma:push`
3. Regenerate client: `npm run prisma:generate`

## Accessing the Database

### Via Prisma Studio
```bash
npm run prisma:studio
# Opens http://localhost:5555
```

### Via pgAdmin (Optional)
```bash
npm run docker:pgadmin
# Opens http://localhost:5050
# Login: admin@smart-assistant.local / admin
```

### Via Command Line
```bash
# Connect to PostgreSQL
docker exec -it smart-assistant-postgres psql -U postgres -d smart_assistant

# Run SQL commands
\dt  # List tables
\d users  # Describe users table
SELECT * FROM users;  # Query data
```

### Via Database Client
Use any PostgreSQL client with:
- **Host**: localhost
- **Port**: 5432
- **Database**: smart_assistant
- **Username**: postgres
- **Password**: postgres

## Troubleshooting

### Container Won't Start
```bash
# Check container status
docker ps -a

# View container logs
npm run docker:logs

# Remove and recreate
npm run docker:clean
npm run docker:setup
```

### Connection Issues
```bash
# Test database connection
docker exec smart-assistant-postgres pg_isready -U postgres -d smart_assistant

# Check if port is available
lsof -i :5432

# Restart with fresh data
npm run docker:clean
npm run docker:setup
```

### Permission Issues
```bash
# Fix volume permissions (Linux/macOS)
docker-compose down
sudo chown -R $(id -u):$(id -g) docker/postgres/
npm run docker:setup
```

### Data Recovery
```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect smart-assistant_postgres_data

# Manual backup
docker run --rm -v smart-assistant_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .
```

## Production Considerations

### Security
- Change default passwords in production
- Use environment-specific configuration
- Enable SSL/TLS connections
- Restrict network access

### Performance
- Adjust PostgreSQL configuration for your workload
- Monitor resource usage
- Set up proper backup strategies
- Consider connection pooling

### Example Production Override
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  postgres:
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/postgres_password
    secrets:
      - postgres_password
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M

secrets:
  postgres_password:
    external: true
```

## Health Checks

The PostgreSQL container includes health checks that verify:
- Database server is running
- Database is accepting connections
- Target database exists

Services that depend on PostgreSQL will wait until it's healthy before starting.

## Network Architecture

```
Host Machine (localhost)
├── Port 5432 → PostgreSQL Container
├── Port 5050 → pgAdmin Container (optional)
└── smart-assistant-network (Docker bridge network)
    ├── postgres container
    └── pgAdmin container
```

## File Structure

```
smart-assistant/
├── docker-compose.yml           # Main Docker Compose configuration
├── .dockerignore               # Docker ignore patterns
├── env.template                # Environment template
├── docker/
│   └── postgres/
│       └── init/
│           └── 01-init.sql    # Database initialization script
└── DOCKER_SETUP.md           # This documentation
```

## Integration with Existing Setup

This Docker setup integrates seamlessly with your existing Prisma configuration:

- Uses the same database schema defined in `prisma/schema.prisma`
- Works with existing npm scripts (`prisma:*`)
- Maintains compatibility with your NestJS backend
- Supports your current development workflow

The only change needed is updating your `DATABASE_URL` environment variable to point to the Docker PostgreSQL instance.
