import axios from 'axios';
import { TestHelpers } from '../support/test-helpers';
import { User } from '@prisma/client';

describe('Backend E2E Tests - Users', () => {
  beforeEach(async () => {
    await TestHelpers.cleanDatabase();
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        email: 'test@example.com',
        name: 'Test User',
      };

      const res = await axios.post('/api/users', createUserDto);

      expect(res.status).toBe(201);
      expect(res.data).toMatchObject({
        email: createUserDto.email,
        name: createUserDto.name,
      });
      expect(res.data.id).toBeDefined();
      expect(res.data.createdAt).toBeDefined();
      expect(res.data.updatedAt).toBeDefined();
    });

    it('should fail to create user with duplicate email', async () => {
      const createUserDto = {
        email: 'duplicate@example.com',
        name: 'First User',
      };

      // Create first user
      await axios.post('/api/users', createUserDto);

      // Try to create second user with same email
      try {
        await axios.post('/api/users', {
          ...createUserDto,
          name: 'Second User',
        });
        fail('Expected request to fail');
      } catch (error) {
        expect(error.response.status).toBe(409);
      }
    });

    it('should fail to create user with invalid data', async () => {
      const invalidData = {
        email: 'invalid-email',
        // missing name
      };

      try {
        await axios.post('/api/users', invalidData);
        fail('Expected request to fail');
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('GET /api/users', () => {
    it('should return empty array when no users exist', async () => {
      const res = await axios.get('/api/users');

      expect(res.status).toBe(200);
      expect(res.data).toEqual([]);
    });

    it('should return all users', async () => {
      // Create test data
      await TestHelpers.seedTestData();

      const res = await axios.get('/api/users');

      expect(res.status).toBe(200);
      expect(res.data).toHaveLength(2);
      expect(res.data.map((u: User) => u.email)).toContain('john.doe@example.com');
      expect(res.data.map((u: User) => u.email)).toContain('jane.smith@example.com');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return a specific user by id', async () => {
      const { users } = await TestHelpers.seedTestData();
      const user = users[0];

      const res = await axios.get(`/api/users/${user.id}`);

      expect(res.status).toBe(200);
      expect(res.data).toMatchObject({
        id: user.id,
        email: user.email,
        name: user.name,
      });
    });

    it('should return 404 for non-existent user', async () => {
      try {
        await axios.get('/api/users/non-existent-id');
        fail('Expected request to fail');
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    });
  });

  describe('PATCH /api/users/:id', () => {
    it('should update user data', async () => {
      const { users } = await TestHelpers.seedTestData();
      const user = users[0];

      const updateData = {
        name: 'Updated Name',
      };

      const res = await axios.patch(`/api/users/${user.id}`, updateData);

      expect(res.status).toBe(200);
      expect(res.data.name).toBe('Updated Name');
      expect(res.data.email).toBe(user.email); // Should remain unchanged
      expect(res.data.id).toBe(user.id);
    });

    it('should update user email', async () => {
      const { users } = await TestHelpers.seedTestData();
      const user = users[0];

      const updateData = {
        email: 'updated@example.com',
      };

      const res = await axios.patch(`/api/users/${user.id}`, updateData);

      expect(res.status).toBe(200);
      expect(res.data.email).toBe('updated@example.com');
      expect(res.data.name).toBe(user.name); // Should remain unchanged
    });

    it('should fail to update with duplicate email', async () => {
      const { users } = await TestHelpers.seedTestData();
      const [user1, user2] = users;

      try {
        await axios.patch(`/api/users/${user1.id}`, {
          email: user2.email,
        });
        fail('Expected request to fail');
      } catch (error) {
        expect(error.response.status).toBe(409);
      }
    });

    it('should return 404 for non-existent user', async () => {
      try {
        await axios.patch('/api/users/non-existent-id', { name: 'Test' });
        fail('Expected request to fail');
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete a user', async () => {
      const { users } = await TestHelpers.seedTestData();
      const user = users[0];

      const res = await axios.delete(`/api/users/${user.id}`);

      expect(res.status).toBe(204);
      expect(res.data).toBe('');

      // Verify user is deleted
      try {
        await axios.get(`/api/users/${user.id}`);
        fail('Expected request to fail');
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    });

    it('should return 404 for non-existent user', async () => {
      try {
        await axios.delete('/api/users/non-existent-id');
        fail('Expected request to fail');
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    });

    it('should cascade delete user threads and messages', async () => {
      const { users } = await TestHelpers.seedTestData();
      const user = users[0];

      // Verify threads exist before deletion
      const threadsRes = await axios.get(`/api/threads?userId=${user.id}`);
      expect(threadsRes.data.length).toBeGreaterThan(0);

      // Delete user
      await axios.delete(`/api/users/${user.id}`);

      // Verify threads are deleted
      const threadsAfterRes = await axios.get(`/api/threads?userId=${user.id}`);
      expect(threadsAfterRes.data).toHaveLength(0);
    });
  });
});
