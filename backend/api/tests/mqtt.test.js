const { MongoClient } = require('mongodb');
const mqtt = require('mqtt');
const request = require('supertest');
const { startApp } = require('../index'); // Import the app instead of requiring index.js directly

jest.mock('mongodb');
jest.mock('mqtt');

// Mocking MongoDB connection setup
beforeAll(() => {
  MongoClient.connect = jest.fn().mockResolvedValue({
    db: jest.fn().mockReturnThis(),
    collection: jest.fn().mockReturnThis(),
    insertOne: jest.fn().mockResolvedValue({}), // Mock insertOne success
  });

  // Mocking MQTT setup
  const mockMqttClient = {
    subscribe: jest.fn(),
    on: jest.fn((event, callback) => {
      if (event === 'message') {
        callback('iot/topic', 'Test MQTT message');
      }
    }),
  };

  mqtt.connect = jest.fn().mockReturnValue(mockMqttClient); // Mock mqtt.connect
});

// After mocks are set up, require the app to ensure MongoDB and MQTT are properly mocked
let app;
beforeAll(() => {
  app = startApp(); // This ensures `index.js` is not executed before mocking
});

describe('IoT Data Collector API', () => {
  it('should return 200 OK on GET /', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('IoT Data Collector API is running.');
  });

  it('should insert data into MongoDB on receiving MQTT message', async () => {
    const response = await request(app).get('/metrics');
    expect(response.status).toBe(200);

    // Check if MongoDB insertOne was called correctly
    const mockMongoClient = MongoClient.connect.mock.results[0].value;
    expect(mockMongoClient.insertOne).toHaveBeenCalledWith({
      topic: 'iot/topic',
      message: 'Test MQTT message',
      timestamp: expect.any(Date),
    });
  });
});
