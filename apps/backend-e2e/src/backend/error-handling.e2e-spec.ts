import axios from 'axios';
import { TestHelpers } from '../support/test-helpers';
import { MessageRole } from '@prisma/client';

describe('Backend E2E Tests - Error Handling', () => {
  beforeEach(async () => {
    await TestHelpers.cleanDatabase();
  });

  describe('HTTP Status Codes', () => {
    it('should return 404 for non-existent endpoints', async () => {
      try {
        await axios.get('/api/nonexistent');
        fail('Expected request to fail');
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    });

    it('should return 404 for unsupported HTTP methods', async () => {
      try {
        await axios.put('/api'); // PUT is not supported on root endpoint
        fail('Expected request to fail');
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    });

    it('should return 400 for malformed JSON', async () => {
      try {
        await axios.post('/api/users', 'invalid json', {
          headers: { 'Content-Type': 'application/json' },
        });
        fail('Expected request to fail');
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('Validation Errors', () => {
    describe('User Validation', () => {
      it('should return 400 for missing required fields', async () => {
        try {
          await axios.post('/api/users', {});
          fail('Expected request to fail');
        } catch (error) {
          expect(error.response.status).toBe(400);
        }
      });

      it('should return 400 for invalid email format', async () => {
        try {
          await axios.post('/api/users', {
            email: 'invalid-email-format',
            name: 'Test User',
          });
          fail('Expected request to fail');
        } catch (error) {
          expect(error.response.status).toBe(400);
        }
      });

      it('should return 409 for duplicate email', async () => {
        const userData = {
          email: 'duplicate@example.com',
          name: 'First User',
        };

        // Create first user
        await axios.post('/api/users', userData);

        // Try to create duplicate
        try {
          await axios.post('/api/users', userData);
          fail('Expected request to fail');
        } catch (error) {
          expect(error.response.status).toBe(409);
        }
      });
    });

    describe('Thread Validation', () => {
      it('should return 400 for missing required fields', async () => {
        try {
          await axios.post('/api/threads', {});
          fail('Expected request to fail');
        } catch (error) {
          expect(error.response.status).toBe(400);
        }
      });

      it('should return 400 for empty title', async () => {
        const { users } = await TestHelpers.seedTestData();
        
        try {
          await axios.post('/api/threads', {
            title: '',
            userId: users[0].id,
          });
          fail('Expected request to fail');
        } catch (error) {
          expect(error.response.status).toBe(400);
        }
      });

      it('should return 400 for non-existent userId', async () => {
        try {
          await axios.post('/api/threads', {
            title: 'Test Thread',
            userId: 'non-existent-user-id',
          });
          fail('Expected request to fail');
        } catch (error) {
          expect(error.response.status).toBe(400);
        }
      });
    });

    describe('Message Validation', () => {
      it('should return 400 for missing required fields', async () => {
        try {
          await axios.post('/api/messages', {});
          fail('Expected request to fail');
        } catch (error) {
          expect(error.response.status).toBe(400);
        }
      });

      it('should return 400 for empty content', async () => {
        const { threads } = await TestHelpers.seedTestData();
        
        try {
          await axios.post('/api/messages', {
            content: '',
            threadId: threads[0].id,
            role: MessageRole.USER,
          });
          fail('Expected request to fail');
        } catch (error) {
          expect(error.response.status).toBe(400);
        }
      });

      it('should return 400 for invalid role', async () => {
        const { threads } = await TestHelpers.seedTestData();
        
        try {
          await axios.post('/api/messages', {
            content: 'Test message',
            threadId: threads[0].id,
            role: 'INVALID_ROLE',
          });
          fail('Expected request to fail');
        } catch (error) {
          expect(error.response.status).toBe(400);
        }
      });

      it('should return 400 for non-existent threadId', async () => {
        try {
          await axios.post('/api/messages', {
            content: 'Test message',
            threadId: 'non-existent-thread-id',
            role: MessageRole.USER,
          });
          fail('Expected request to fail');
        } catch (error) {
          expect(error.response.status).toBe(400);
        }
      });
    });
  });

  describe('Resource Not Found Errors', () => {
    it('should return 404 for non-existent user', async () => {
      try {
        await axios.get('/api/users/non-existent-id');
        fail('Expected request to fail');
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    });

    it('should return 404 for non-existent thread', async () => {
      try {
        await axios.get('/api/threads/non-existent-id');
        fail('Expected request to fail');
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    });

    it('should return 404 for non-existent message', async () => {
      try {
        await axios.get('/api/messages/non-existent-id');
        fail('Expected request to fail');
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    });

    it('should return 404 when updating non-existent resources', async () => {
      const updateData = { name: 'Updated' };

      try {
        await axios.patch('/api/users/non-existent-id', updateData);
        fail('Expected request to fail');
      } catch (error) {
        expect(error.response.status).toBe(404);
      }

      try {
        await axios.patch('/api/threads/non-existent-id', { title: 'Updated' });
        fail('Expected request to fail');
      } catch (error) {
        expect(error.response.status).toBe(404);
      }

      try {
        await axios.patch('/api/messages/non-existent-id', { content: 'Updated' });
        fail('Expected request to fail');
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    });

    it('should return 404 when deleting non-existent resources', async () => {
      try {
        await axios.delete('/api/users/non-existent-id');
        fail('Expected request to fail');
      } catch (error) {
        expect(error.response.status).toBe(404);
      }

      try {
        await axios.delete('/api/threads/non-existent-id');
        fail('Expected request to fail');
      } catch (error) {
        expect(error.response.status).toBe(404);
      }

      try {
        await axios.delete('/api/messages/non-existent-id');
        fail('Expected request to fail');
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    });
  });

  describe('Content Type Errors', () => {
    it('should handle missing Content-Type header', async () => {
      try {
        await axios.post('/api/users', 'some data', {
          headers: { 'Content-Type': undefined },
        });
        fail('Expected request to fail');
      } catch (error) {
        expect([400, 500].includes(error.response.status)).toBe(true);
      }
    });

    it('should handle unsupported Content-Type', async () => {
      try {
        await axios.post('/api/users', 'some data', {
          headers: { 'Content-Type': 'text/plain' },
        });
        fail('Expected request to fail');
      } catch (error) {
        expect([400, 415, 500].includes(error.response.status)).toBe(true);
      }
    });
  });

  describe('Query Parameter Errors', () => {
    it('should handle invalid query parameters gracefully', async () => {
      // These should not cause server errors, but should be handled gracefully
      const res1 = await axios.get('/api/threads?userId=invalid-id');
      expect(res1.status).toBe(200);
      expect(res1.data).toEqual([]);

      const res2 = await axios.get('/api/messages?threadId=invalid-id');
      expect(res2.status).toBe(200);
      expect(res2.data).toEqual([]);
    });
  });

  describe('Database Constraint Errors', () => {
    it('should handle foreign key constraint violations', async () => {
      // This is tested in other specs, but worth mentioning here
      // Foreign key violations should return 400 status codes
      try {
        await axios.post('/api/threads', {
          title: 'Test Thread',
          userId: 'non-existent-user-id',
        });
        fail('Expected request to fail');
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should handle unique constraint violations', async () => {
      const userData = {
        email: 'unique@example.com',
        name: 'Test User',
      };

      // Create first user
      await axios.post('/api/users', userData);

      // Try to create duplicate
      try {
        await axios.post('/api/users', userData);
        fail('Expected request to fail');
      } catch (error) {
        expect(error.response.status).toBe(409);
      }
    });
  });

  describe('Error Response Format', () => {
    it('should return consistent error response format', async () => {
      try {
        await axios.get('/api/users/non-existent-id');
        fail('Expected request to fail');
      } catch (error) {
        expect(error.response.status).toBe(404);
        expect(error.response.data).toBeDefined();
        
        // The exact format depends on NestJS error handling
        // Common formats include { message, error, statusCode }
        expect(typeof error.response.data).toBe('object');
      }
    });

    it('should include helpful error messages', async () => {
      try {
        await axios.post('/api/users', {});
        fail('Expected request to fail');
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toBeDefined();
        
        // Should contain some indication of what went wrong
        const errorData = error.response.data;
        expect(errorData.message || errorData.error).toBeDefined();
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long input strings', async () => {
      const longString = 'a'.repeat(10000);
      
      try {
        await axios.post('/api/users', {
          email: `${longString}@example.com`,
          name: longString,
        });
        fail('Expected request to fail');
      } catch (error) {
        expect(error.response?.status || 500).toBeGreaterThanOrEqual(400);
      }
    });

    it('should handle special characters in input', async () => {
      const specialChars = {
        email: 'test+special@example.com',
        name: 'Test User with Special Characters: !@#$%^&*()',
      };

      const res = await axios.post('/api/users', specialChars);
      expect(res.status).toBe(201);
      expect(res.data.name).toBe(specialChars.name);
    });

    it('should handle Unicode characters', async () => {
      const unicodeData = {
        email: 'unicode@example.com',
        name: 'Test User 测试用户 👤',
      };

      const res = await axios.post('/api/users', unicodeData);
      expect(res.status).toBe(201);
      expect(res.data.name).toBe(unicodeData.name);
    });
  });
});
