# Prisma Setup Guide

This guide explains how Prisma has been set up in the smart-assistant backend project for data access.

## What's Been Configured

### 1. Dependencies Installed
- `prisma` - Prisma CLI for database management
- `@prisma/client` - Prisma Client for database queries
- `@nestjs/config` - NestJS configuration module for environment variables

### 2. Prisma Schema
Located at `/prisma/schema.prisma`, defines:
- **User Model**: Basic user information with email, name, and timestamps
- **Thread Model**: Conversation threads belonging to users
- **Message Model**: Individual messages within threads with role-based typing
- **MessageRole Enum**: USER, ASSISTANT, SYSTEM roles

### 3. Database Configuration
- **Database**: PostgreSQL (configurable via `DATABASE_URL`)
- **Environment File**: `.env` with database connection string
- **Default URL**: `postgresql://username:password@localhost:5432/smart_assistant?schema=public`

### 4. NestJS Integration
- **PrismaService**: Global service extending PrismaClient
- **PrismaModule**: Global module providing PrismaService
- **Updated Services**: All CRUD services now use Prisma instead of in-memory arrays
- **Async Operations**: All database operations are now asynchronous

## Database Models

### User
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  threads   Thread[]
}
```

### Thread
```prisma
model Thread {
  id        String   @id @default(cuid())
  title     String
  userId    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages  Message[]
}
```

### Message
```prisma
model Message {
  id        String      @id @default(cuid())
  content   String
  threadId  String
  role      MessageRole @default(USER)
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
  thread    Thread      @relation(fields: [threadId], references: [id], onDelete: Cascade)
}
```

## Available Scripts

Run these commands from the project root:

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to database (development)
npm run prisma:push

# Open Prisma Studio (database GUI)
npm run prisma:studio

# Reset database (WARNING: deletes all data)
npm run prisma:reset

# Complete setup (generate + push)
npm run prisma:setup
```

## Getting Started

### 1. Set up your database
Update the `DATABASE_URL` in your `.env` file:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/smart_assistant?schema=public"
```

### 2. Push the schema to your database
```bash
npm run prisma:push
```

### 3. Generate the Prisma Client
```bash
npm run prisma:generate
```

### 4. Start your application
```bash
npm start
```

## Key Changes Made

### Services Updated
- **UserService**: Now uses `prisma.user` operations with async/await
- **ThreadService**: Now uses `prisma.thread` with user validation
- **MessageService**: Now uses `prisma.message` with thread validation

### Controllers Updated
- All controller methods are now `async`
- Return types updated to `Promise<T>`
- Proper error handling for database operations

### Features Added
- **Relationships**: Proper foreign key relationships between models
- **Cascade Deletes**: Deleting a user removes their threads and messages
- **Validation**: Automatic validation of foreign key references
- **Ordering**: Messages ordered by creation date
- **Includes**: Related data automatically included in responses

## Database Operations Examples

### Create a User
```typescript
const user = await userService.create({
  email: 'user@example.com',
  name: 'John Doe'
});
```

### Get User with Threads
```typescript
const user = await userService.findOne('user-id'); // Includes threads
```

### Create a Thread
```typescript
const thread = await threadService.create({
  title: 'My Conversation',
  userId: 'user-id'
});
```

### Add a Message
```typescript
const message = await messageService.create({
  content: 'Hello, world!',
  threadId: 'thread-id',
  role: 'USER'
});
```

## Development Tools

### Prisma Studio
Access a visual database editor:
```bash
npm run prisma:studio
```

### Schema Changes
After modifying `prisma/schema.prisma`:
1. Run `npm run prisma:push` to apply changes
2. Run `npm run prisma:generate` to update the client

### Migration (Production)
For production deployments, use migrations instead of `db push`:
```bash
npx prisma migrate dev --name your-migration-name
npx prisma migrate deploy  # for production
```

## Troubleshooting

### Common Issues
1. **Database Connection**: Ensure PostgreSQL is running and connection string is correct
2. **Schema Sync**: Run `npm run prisma:push` after schema changes
3. **Client Generation**: Run `npm run prisma:generate` after schema changes
4. **Type Errors**: Restart TypeScript server after generating client

### Reset Everything
If you need to start fresh:
```bash
npm run prisma:reset
npm run prisma:generate
```

This setup provides a robust, type-safe database layer for your smart-assistant application with proper relationships and data validation.

