import axios from 'axios';
import { TestHelpers } from '../support/test-helpers';
import { Message, MessageRole } from '@prisma/client';

describe('Backend E2E Tests - Messages', () => {
  beforeEach(async () => {
    await TestHelpers.cleanDatabase();
  });

  describe('POST /api/messages', () => {
    it('should create a new message', async () => {
      const { threads } = await TestHelpers.seedTestData();
      const thread = threads[0];

      const createMessageDto = {
        content: 'This is a new test message',
        threadId: thread.id,
        role: MessageRole.USER,
      };

      const res = await axios.post('/api/messages', createMessageDto);

      expect(res.status).toBe(201);
      expect(res.data).toMatchObject({
        content: createMessageDto.content,
        threadId: createMessageDto.threadId,
        role: createMessageDto.role,
      });
      expect(res.data.id).toBeDefined();
      expect(res.data.createdAt).toBeDefined();
      expect(res.data.updatedAt).toBeDefined();
    });

    it('should create assistant message', async () => {
      const { threads } = await TestHelpers.seedTestData();
      const thread = threads[0];

      const createMessageDto = {
        content: 'This is an assistant response',
        threadId: thread.id,
        role: MessageRole.ASSISTANT,
      };

      const res = await axios.post('/api/messages', createMessageDto);

      expect(res.status).toBe(201);
      expect(res.data.role).toBe(MessageRole.ASSISTANT);
    });

    it('should create system message', async () => {
      const { threads } = await TestHelpers.seedTestData();
      const thread = threads[0];

      const createMessageDto = {
        content: 'System initialization message',
        threadId: thread.id,
        role: MessageRole.SYSTEM,
      };

      const res = await axios.post('/api/messages', createMessageDto);

      expect(res.status).toBe(201);
      expect(res.data.role).toBe(MessageRole.SYSTEM);
    });

    it('should fail to create message with non-existent thread', async () => {
      const createMessageDto = {
        content: 'Test message',
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

    it('should fail to create message with invalid data', async () => {
      const invalidData = {
        content: '', // empty content
        threadId: 'invalid-thread-id',
        role: 'INVALID_ROLE',
      };

      try {
        await axios.post('/api/messages', invalidData);
        fail('Expected request to fail');
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('GET /api/messages', () => {
    it('should return empty array when no messages exist', async () => {
      const res = await axios.get('/api/messages');

      expect(res.status).toBe(200);
      expect(res.data).toEqual([]);
    });

    it('should return all messages', async () => {
      const { messages } = await TestHelpers.seedTestData();

      const res = await axios.get('/api/messages');

      expect(res.status).toBe(200);
      expect(res.data).toHaveLength(3);
      expect(res.data.map((m: Message) => m.content)).toContain('Hello, this is a test message');
      expect(res.data.map((m: Message) => m.content)).toContain('This is an assistant response');
      expect(res.data.map((m: Message) => m.content)).toContain('Another user message');
    });

    it('should filter messages by threadId', async () => {
      const { threads, messages } = await TestHelpers.seedTestData();
      const thread1 = threads[0];
      const thread2 = threads[1];

      // Get messages for thread1
      const res1 = await axios.get(`/api/messages?threadId=${thread1.id}`);
      expect(res1.status).toBe(200);
      expect(res1.data).toHaveLength(2);
      expect(res1.data.every((m: Message) => m.threadId === thread1.id)).toBe(true);

      // Get messages for thread2
      const res2 = await axios.get(`/api/messages?threadId=${thread2.id}`);
      expect(res2.status).toBe(200);
      expect(res2.data).toHaveLength(1);
      expect(res2.data[0].threadId).toBe(thread2.id);
      expect(res2.data[0].content).toBe('Another user message');
    });

    it('should return empty array for thread with no messages', async () => {
      const { threads } = await TestHelpers.seedTestData();
      const emptyThread = threads[2]; // Jane's Thread has no messages in seed data

      const res = await axios.get(`/api/messages?threadId=${emptyThread.id}`);
      expect(res.status).toBe(200);
      expect(res.data).toEqual([]);
    });

    it('should return messages in chronological order', async () => {
      const { threads } = await TestHelpers.seedTestData();
      const thread = threads[0];

      // Create additional messages with small delays to ensure different timestamps
      await axios.post('/api/messages', {
        content: 'First message',
        threadId: thread.id,
        role: MessageRole.USER,
      });

      await new Promise(resolve => setTimeout(resolve, 10));

      await axios.post('/api/messages', {
        content: 'Second message',
        threadId: thread.id,
        role: MessageRole.ASSISTANT,
      });

      const res = await axios.get(`/api/messages?threadId=${thread.id}`);
      expect(res.status).toBe(200);
      
      // Verify messages are ordered by creation time
      for (let i = 1; i < res.data.length; i++) {
        expect(new Date(res.data[i].createdAt).getTime()).toBeGreaterThanOrEqual(
          new Date(res.data[i - 1].createdAt).getTime()
        );
      }
    });
  });

  describe('GET /api/messages/:id', () => {
    it('should return a specific message by id', async () => {
      const { messages } = await TestHelpers.seedTestData();
      const message = messages[0];

      const res = await axios.get(`/api/messages/${message.id}`);

      expect(res.status).toBe(200);
      expect(res.data).toMatchObject({
        id: message.id,
        content: message.content,
        threadId: message.threadId,
        role: message.role,
      });
    });

    it('should return 404 for non-existent message', async () => {
      try {
        await axios.get('/api/messages/non-existent-id');
        fail('Expected request to fail');
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    });
  });

  describe('PATCH /api/messages/:id', () => {
    it('should update message content', async () => {
      const { messages } = await TestHelpers.seedTestData();
      const message = messages[0];

      const updateData = {
        content: 'Updated message content',
      };

      const res = await axios.patch(`/api/messages/${message.id}`, updateData);

      expect(res.status).toBe(200);
      expect(res.data.content).toBe('Updated message content');
      expect(res.data.threadId).toBe(message.threadId); // Should remain unchanged
      expect(res.data.role).toBe(message.role); // Should remain unchanged
      expect(res.data.id).toBe(message.id);
    });

    it('should update message role', async () => {
      const { messages } = await TestHelpers.seedTestData();
      const message = messages[0];

      const updateData = {
        role: MessageRole.SYSTEM,
      };

      const res = await axios.patch(`/api/messages/${message.id}`, updateData);

      expect(res.status).toBe(200);
      expect(res.data.role).toBe(MessageRole.SYSTEM);
      expect(res.data.content).toBe(message.content); // Should remain unchanged
    });

    it('should update multiple fields', async () => {
      const { messages } = await TestHelpers.seedTestData();
      const message = messages[0];

      const updateData = {
        content: 'Updated content',
        role: MessageRole.ASSISTANT,
      };

      const res = await axios.patch(`/api/messages/${message.id}`, updateData);

      expect(res.status).toBe(200);
      expect(res.data.content).toBe('Updated content');
      expect(res.data.role).toBe(MessageRole.ASSISTANT);
    });

    it('should fail to update with invalid role', async () => {
      const { messages } = await TestHelpers.seedTestData();
      const message = messages[0];

      try {
        await axios.patch(`/api/messages/${message.id}`, {
          role: 'INVALID_ROLE',
        });
        fail('Expected request to fail');
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should return 404 for non-existent message', async () => {
      try {
        await axios.patch('/api/messages/non-existent-id', { content: 'Test' });
        fail('Expected request to fail');
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    });
  });

  describe('DELETE /api/messages/:id', () => {
    it('should delete a message', async () => {
      const { messages } = await TestHelpers.seedTestData();
      const message = messages[0];

      const res = await axios.delete(`/api/messages/${message.id}`);

      expect(res.status).toBe(204);
      expect(res.data).toBe('');

      // Verify message is deleted
      try {
        await axios.get(`/api/messages/${message.id}`);
        fail('Expected request to fail');
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    });

    it('should return 404 for non-existent message', async () => {
      try {
        await axios.delete('/api/messages/non-existent-id');
        fail('Expected request to fail');
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    });

    it('should not affect other messages in the same thread', async () => {
      const { messages, threads } = await TestHelpers.seedTestData();
      const messageToDelete = messages[0];
      const thread = threads[0];

      // Get initial count of messages in thread
      const initialRes = await axios.get(`/api/messages?threadId=${thread.id}`);
      const initialCount = initialRes.data.length;

      // Delete one message
      await axios.delete(`/api/messages/${messageToDelete.id}`);

      // Verify other messages still exist
      const afterRes = await axios.get(`/api/messages?threadId=${thread.id}`);
      expect(afterRes.data.length).toBe(initialCount - 1);
      expect(afterRes.data.map((m: Message) => m.id)).not.toContain(messageToDelete.id);
    });
  });
});
