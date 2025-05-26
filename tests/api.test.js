const request = require('supertest');
const app = require('../app'); // Use app.js, not index.js

describe('IoT Data Collector API', () => {
  it('should return 200 OK on GET /', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('IoT Data Collector API is running.');
  });

  it('should return Prometheus metrics on GET /metrics', async () => {
    const response = await request(app).get('/metrics');
    expect(response.status).toBe(200);
    expect(response.text).toContain('# HELP http_requests_total');
  });
});
