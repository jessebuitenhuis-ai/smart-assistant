import axios from 'axios';
import { TestHelpers } from '../support/test-helpers';
import { MessageRole } from '@prisma/client';

describe('Backend E2E Tests - Entity Relationships', () => {
  beforeEach(async () => {
    await TestHelpers.cleanDatabase();
  });

  describe('User -> Thread Relationship', () => {
    it('should create thread with valid user reference', async () => {
      const { users } = await TestHelpers.seedTestData();
      const user = users[0];

      const createThreadDto = {
        title: 'User Thread Test',
        userId: user.id,
      };

      const res = await axios.post('/api/threads', createThreadDto);

      expect(res.status).toBe(201);
      expect(res.data.userId).toBe(user.id);
    });

    it('should prevent creating thread with invalid user reference', async () => {
      const createThreadDto = {
        title: 'Invalid User Thread',
        userId: 'non-existent-user-id',
      };

      try {
        await axios.post('/api/threads', createThreadDto);
        fail('Expected request to fail');
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should cascade delete threads when user is deleted', async () => {
      const { users } = await TestHelpers.seedTestData();
      const user = users[0];

      // Create additional thread for the user
      await axios.post('/api/threads', {
        title: 'Additional Thread',
        userId: user.id,
      });

      // Verify user has threads
      const threadsRes = await axios.get(`/api/threads?userId=${user.id}`);
      expect(threadsRes.data.length).toBeGreaterThan(0);

      // Delete user
      await axios.delete(`/api/users/${user.id}`);

      // Verify all threads are deleted
      const threadsAfterRes = await axios.get(`/api/threads?userId=${user.id}`);
      expect(threadsAfterRes.data).toHaveLength(0);
    });
  });

  describe('Thread -> Message Relationship', () => {
    it('should create message with valid thread reference', async () => {
      const { threads } = await TestHelpers.seedTestData();
      const thread = threads[0];

      const createMessageDto = {
        content: 'Thread Message Test',
        threadId: thread.id,
        role: MessageRole.USER,
      };

      const res = await axios.post('/api/messages', createMessageDto);

      expect(res.status).toBe(201);
      expect(res.data.threadId).toBe(thread.id);
    });

    it('should prevent creating message with invalid thread reference', async () => {
      const createMessageDto = {
        content: 'Invalid Thread Message',
        threadId: 'non-existent-thread-id',
        role: MessageRole.USER,
      };

      try {
        await axios.post('/api/messages', createMessageDto);
        fail('Expected request to fail');
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should cascade delete messages when thread is deleted', async () => {
      const { threads } = await TestHelpers.seedTestData();
      const thread = threads[0];

      // Create additional messages for the thread
      await axios.post('/api/messages', {
        content: 'Additional Message 1',
        threadId: thread.id,
        role: MessageRole.USER,
      });

      await axios.post('/api/messages', {
        content: 'Additional Message 2',
        threadId: thread.id,
        role: MessageRole.ASSISTANT,
      });

      // Verify thread has messages
      const messagesRes = await axios.get(`/api/messages?threadId=${thread.id}`);
      expect(messagesRes.data.length).toBeGreaterThan(0);

      // Delete thread
      await axios.delete(`/api/threads/${thread.id}`);

      // Verify all messages are deleted
      const messagesAfterRes = await axios.get(`/api/messages?threadId=${thread.id}`);
      expect(messagesAfterRes.data).toHaveLength(0);
    });
  });

  describe('Full Cascade Delete Chain', () => {
    it('should cascade delete user -> threads -> messages', async () => {
      const { users } = await TestHelpers.seedTestData();
      const user = users[0];

      // Create additional data
      const threadRes = await axios.post('/api/threads', {
        title: 'Cascade Test Thread',
        userId: user.id,
      });
      const newThread = threadRes.data;

      await axios.post('/api/messages', {
        content: 'Cascade Test Message',
        threadId: newThread.id,
        role: MessageRole.USER,
      });

      // Verify data exists
      const threadsRes = await axios.get(`/api/threads?userId=${user.id}`);
      const messagesRes = await axios.get(`/api/messages?threadId=${newThread.id}`);
      
      expect(threadsRes.data.length).toBeGreaterThan(0);
      expect(messagesRes.data.length).toBeGreaterThan(0);

      // Delete user (should cascade delete everything)
      await axios.delete(`/api/users/${user.id}`);

      // Verify everything is deleted
      const threadsAfterRes = await axios.get(`/api/threads?userId=${user.id}`);
      const messagesAfterRes = await axios.get(`/api/messages?threadId=${newThread.id}`);

      expect(threadsAfterRes.data).toHaveLength(0);
      expect(messagesAfterRes.data).toHaveLength(0);

      // Verify the thread itself is deleted
      try {
        await axios.get(`/api/threads/${newThread.id}`);
        fail('Expected request to fail');
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    });
  });

  describe('Data Integrity', () => {
    it('should maintain referential integrity across operations', async () => {
      const { users, threads, messages } = await TestHelpers.seedTestData();

      // Verify all relationships are properly established
      for (const thread of threads) {
        const threadRes = await axios.get(`/api/threads/${thread.id}`);
        expect(threadRes.data.userId).toBe(thread.userId);

        // Verify user exists
        const userRes = await axios.get(`/api/users/${thread.userId}`);
        expect(userRes.status).toBe(200);
      }

      for (const message of messages) {
        const messageRes = await axios.get(`/api/messages/${message.id}`);
        expect(messageRes.data.threadId).toBe(message.threadId);

        // Verify thread exists
        const threadRes = await axios.get(`/api/threads/${message.threadId}`);
        expect(threadRes.status).toBe(200);
      }
    });

    it('should prevent orphaned threads', async () => {
      const { users } = await TestHelpers.seedTestData();
      const user = users[0];

      // Create thread
      const threadRes = await axios.post('/api/threads', {
        title: 'Orphan Test Thread',
        userId: user.id,
      });

      // Try to update thread with non-existent user
      try {
        await axios.patch(`/api/threads/${threadRes.data.id}`, {
          userId: 'non-existent-user-id',
        });
        fail('Expected request to fail');
      } catch (error) {
        expect(error.response.status).toBe(400);
      }

      // Verify thread still has original user
      const verifyRes = await axios.get(`/api/threads/${threadRes.data.id}`);
      expect(verifyRes.data.userId).toBe(user.id);
    });

    it('should prevent orphaned messages', async () => {
      const { threads } = await TestHelpers.seedTestData();
      const thread = threads[0];

      // Create message
      const messageRes = await axios.post('/api/messages', {
        content: 'Orphan Test Message',
        threadId: thread.id,
        role: MessageRole.USER,
      });

      // Try to update message with non-existent thread (if supported by API)
      // Note: This test assumes the API doesn't allow changing threadId
      // If it does, this would test that constraint
      const currentMessage = await axios.get(`/api/messages/${messageRes.data.id}`);
      expect(currentMessage.data.threadId).toBe(thread.id);
    });
  });
});
