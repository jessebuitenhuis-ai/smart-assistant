import axios from 'axios';
import { TestHelpers } from '../support/test-helpers';
import { Thread } from '@prisma/client';

describe('Backend E2E Tests - Threads', () => {
  beforeEach(async () => {
    await TestHelpers.cleanDatabase();
  });

  describe('POST /api/threads', () => {
    it('should create a new thread', async () => {
      const { users } = await TestHelpers.seedTestData();
      const user = users[0];

      const createThreadDto = {
        title: 'New Test Thread',
        userId: user.id,
      };

      const res = await axios.post('/api/threads', createThreadDto);

      expect(res.status).toBe(201);
      expect(res.data).toMatchObject({
        title: createThreadDto.title,
        userId: createThreadDto.userId,
      });
      expect(res.data.id).toBeDefined();
      expect(res.data.createdAt).toBeDefined();
      expect(res.data.updatedAt).toBeDefined();
    });

    it('should fail to create thread with non-existent user', async () => {
      const createThreadDto = {
        title: 'Test Thread',
        userId: 'non-existent-user-id',
      };

      try {
        await axios.post('/api/threads', createThreadDto);
        fail('Expected request to fail');
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should fail to create thread with invalid data', async () => {
      const invalidData = {
        title: '', // empty title
        userId: 'invalid-user-id',
      };

      try {
        await axios.post('/api/threads', invalidData);
        fail('Expected request to fail');
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('GET /api/threads', () => {
    it('should return empty array when no threads exist', async () => {
      const res = await axios.get('/api/threads');

      expect(res.status).toBe(200);
      expect(res.data).toEqual([]);
    });

    it('should return all threads', async () => {
      const { threads } = await TestHelpers.seedTestData();

      const res = await axios.get('/api/threads');

      expect(res.status).toBe(200);
      expect(res.data).toHaveLength(3);
      expect(res.data.map((t: Thread) => t.title)).toContain('Test Thread 1');
      expect(res.data.map((t: Thread) => t.title)).toContain('Test Thread 2');
      expect(res.data.map((t: Thread) => t.title)).toContain('Jane\'s Thread');
    });

    it('should filter threads by userId', async () => {
      const { users, threads } = await TestHelpers.seedTestData();
      const user1 = users[0];
      const user2 = users[1];

      // Get threads for user1
      const res1 = await axios.get(`/api/threads?userId=${user1.id}`);
      expect(res1.status).toBe(200);
      expect(res1.data).toHaveLength(2);
      expect(res1.data.every((t: Thread) => t.userId === user1.id)).toBe(true);

      // Get threads for user2
      const res2 = await axios.get(`/api/threads?userId=${user2.id}`);
      expect(res2.status).toBe(200);
      expect(res2.data).toHaveLength(1);
      expect(res2.data[0].userId).toBe(user2.id);
      expect(res2.data[0].title).toBe('Jane\'s Thread');
    });

    it('should return empty array for user with no threads', async () => {
      const { users } = await TestHelpers.seedTestData();
      
      // Create a new user with no threads
      const newUser = await TestHelpers.getPrismaClient().user.create({
        data: {
          email: 'no-threads@example.com',
          name: 'No Threads User',
        },
      });

      const res = await axios.get(`/api/threads?userId=${newUser.id}`);
      expect(res.status).toBe(200);
      expect(res.data).toEqual([]);
    });
  });

  describe('GET /api/threads/:id', () => {
    it('should return a specific thread by id', async () => {
      const { threads } = await TestHelpers.seedTestData();
      const thread = threads[0];

      const res = await axios.get(`/api/threads/${thread.id}`);

      expect(res.status).toBe(200);
      expect(res.data).toMatchObject({
        id: thread.id,
        title: thread.title,
        userId: thread.userId,
      });
    });

    it('should return 404 for non-existent thread', async () => {
      try {
        await axios.get('/api/threads/non-existent-id');
        fail('Expected request to fail');
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    });
  });

  describe('PATCH /api/threads/:id', () => {
    it('should update thread title', async () => {
      const { threads } = await TestHelpers.seedTestData();
      const thread = threads[0];

      const updateData = {
        title: 'Updated Thread Title',
      };

      const res = await axios.patch(`/api/threads/${thread.id}`, updateData);

      expect(res.status).toBe(200);
      expect(res.data.title).toBe('Updated Thread Title');
      expect(res.data.userId).toBe(thread.userId); // Should remain unchanged
      expect(res.data.id).toBe(thread.id);
    });

    it('should update thread userId', async () => {
      const { users, threads } = await TestHelpers.seedTestData();
      const thread = threads[0];
      const newUser = users[1];

      const updateData = {
        userId: newUser.id,
      };

      const res = await axios.patch(`/api/threads/${thread.id}`, updateData);

      expect(res.status).toBe(200);
      expect(res.data.userId).toBe(newUser.id);
      expect(res.data.title).toBe(thread.title); // Should remain unchanged
    });

    it('should fail to update with non-existent userId', async () => {
      const { threads } = await TestHelpers.seedTestData();
      const thread = threads[0];

      try {
        await axios.patch(`/api/threads/${thread.id}`, {
          userId: 'non-existent-user-id',
        });
        fail('Expected request to fail');
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should return 404 for non-existent thread', async () => {
      try {
        await axios.patch('/api/threads/non-existent-id', { title: 'Test' });
        fail('Expected request to fail');
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    });
  });

  describe('DELETE /api/threads/:id', () => {
    it('should delete a thread', async () => {
      const { threads } = await TestHelpers.seedTestData();
      const thread = threads[0];

      const res = await axios.delete(`/api/threads/${thread.id}`);

      expect(res.status).toBe(204);
      expect(res.data).toBe('');

      // Verify thread is deleted
      try {
        await axios.get(`/api/threads/${thread.id}`);
        fail('Expected request to fail');
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    });

    it('should return 404 for non-existent thread', async () => {
      try {
        await axios.delete('/api/threads/non-existent-id');
        fail('Expected request to fail');
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    });

    it('should cascade delete thread messages', async () => {
      const { threads } = await TestHelpers.seedTestData();
      const thread = threads[0];

      // Verify messages exist before deletion
      const messagesRes = await axios.get(`/api/messages?threadId=${thread.id}`);
      expect(messagesRes.data.length).toBeGreaterThan(0);

      // Delete thread
      await axios.delete(`/api/threads/${thread.id}`);

      // Verify messages are deleted
      const messagesAfterRes = await axios.get(`/api/messages?threadId=${thread.id}`);
      expect(messagesAfterRes.data).toHaveLength(0);
    });
  });
});
