# Backend E2E Tests

This directory contains comprehensive end-to-end tests for the smart-assistant backend API.

## Test Coverage

The e2e tests cover the following areas:

### 1. **App Controller Tests** (`backend.spec.ts`)
- Basic API health check endpoint
- Invalid route handling

### 2. **Users CRUD Tests** (`users.e2e-spec.ts`)
- Create users with valid data
- Handle duplicate email validation
- Retrieve all users and individual users
- Update user information
- Delete users with cascade operations
- Error handling for invalid operations

### 3. **Threads CRUD Tests** (`threads.e2e-spec.ts`)
- Create threads linked to users
- Filter threads by user ID
- Update thread information
- Delete threads with cascade operations
- Relationship validation with users

### 4. **Messages CRUD Tests** (`messages.e2e-spec.ts`)
- Create messages with different roles (USER, ASSISTANT, SYSTEM)
- Filter messages by thread ID
- Update message content and roles
- Delete individual messages
- Message ordering and chronological tests

### 5. **Relationship Tests** (`relationships.e2e-spec.ts`)
- User -> Thread relationship validation
- Thread -> Message relationship validation
- Cascade delete operations across all entities
- Referential integrity enforcement
- Orphaned record prevention

### 6. **Error Handling Tests** (`error-handling.e2e-spec.ts`)
- HTTP status code validation (404, 400, 409, 405, 415)
- Input validation errors
- Resource not found errors
- Database constraint violations
- Content-Type handling
- Edge cases (long strings, special characters, Unicode)

## Test Infrastructure

### Test Helpers (`test-helpers.ts`)
- Database cleanup utilities
- Test data seeding functions
- Prisma client management
- Reusable test fixtures

### Global Setup/Teardown
- **Global Setup**: Waits for backend server, cleans database
- **Global Teardown**: Cleans database, disconnects Prisma, kills server
- **Test Setup**: Configures axios base URL

## Running Tests

### Prerequisites
1. Ensure PostgreSQL database is running (via Docker or local installation)
2. Backend server must be built and running
3. Database should be set up with proper schema

### Commands

```bash
# Run all e2e tests
nx e2e backend-e2e

# Run tests with coverage
nx e2e backend-e2e --coverage

# Run specific test file
nx e2e backend-e2e --testPathPattern=users.e2e-spec.ts

# Run tests in watch mode (for development)
nx e2e backend-e2e --watch
```

### Environment Variables
- `HOST`: Backend server host (default: localhost)
- `PORT`: Backend server port (default: 3000)
- `DATABASE_URL`: PostgreSQL connection string

## Test Data Management

Each test file uses `beforeEach` hooks to ensure a clean database state:
- All tests start with an empty database
- Test data is seeded as needed using `TestHelpers.seedTestData()`
- Database is cleaned after each test to prevent interference

## Test Structure

Each test file follows a consistent structure:
1. **Setup**: Clean database, seed test data if needed
2. **Arrange**: Prepare test data and conditions
3. **Act**: Execute the API call being tested
4. **Assert**: Verify expected outcomes and side effects

## API Endpoints Tested

### Users (`/api/users`)
- `POST /api/users` - Create user
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Threads (`/api/threads`)
- `POST /api/threads` - Create thread
- `GET /api/threads` - List all threads
- `GET /api/threads?userId=:id` - Filter threads by user
- `GET /api/threads/:id` - Get thread by ID
- `PATCH /api/threads/:id` - Update thread
- `DELETE /api/threads/:id` - Delete thread

### Messages (`/api/messages`)
- `POST /api/messages` - Create message
- `GET /api/messages` - List all messages
- `GET /api/messages?threadId=:id` - Filter messages by thread
- `GET /api/messages/:id` - Get message by ID
- `PATCH /api/messages/:id` - Update message
- `DELETE /api/messages/:id` - Delete message

## Error Scenarios Covered

- **Validation Errors**: Missing required fields, invalid formats
- **Constraint Violations**: Duplicate emails, foreign key violations
- **Not Found Errors**: Non-existent resource access
- **Method Not Allowed**: Unsupported HTTP methods
- **Content Type Errors**: Invalid or missing Content-Type headers
- **Edge Cases**: Long strings, special characters, Unicode support

## Database Schema Dependencies

The tests assume the following Prisma schema structure:
- **User**: id, email (unique), name, createdAt, updatedAt
- **Thread**: id, title, userId (FK), createdAt, updatedAt
- **Message**: id, content, threadId (FK), role (enum), createdAt, updatedAt

With cascade delete relationships:
- Deleting a User cascades to delete all their Threads
- Deleting a Thread cascades to delete all its Messages
