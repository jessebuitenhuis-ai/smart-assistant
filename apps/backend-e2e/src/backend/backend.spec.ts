import axios from 'axios';

describe('Backend E2E Tests - App Controller', () => {
  describe('GET /api', () => {
    it('should return a welcome message', async () => {
      const res = await axios.get(`/api`);

      expect(res.status).toBe(200);
      expect(res.data).toEqual({ message: 'Hello API' });
    });

    it('should handle invalid routes with 404', async () => {
      try {
        await axios.get('/api/nonexistent-route');
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    });
  });
});
