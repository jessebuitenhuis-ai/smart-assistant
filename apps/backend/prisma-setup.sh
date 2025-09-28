#!/bin/bash

# Prisma database setup script
echo "Setting up Prisma database..."

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate --schema=../../libs/shared/prisma/prisma/schema.prisma

# Push the schema to the database (for development)
echo "Pushing schema to database..."
npx prisma db push --schema=../../libs/shared/prisma/prisma/schema.prisma

echo "Prisma setup complete!"
echo ""
echo "To view your database in Prisma Studio, run:"
echo "npx prisma studio --schema=libs/shared/prisma/prisma/schema.prisma"
echo ""
echo "To reset the database (if needed), run:"
echo "npx prisma db push --force-reset --schema=libs/shared/prisma/prisma/schema.prisma"

