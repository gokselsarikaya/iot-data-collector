const express = require('express');
const mqtt = require('mqtt');
const { MongoClient } = require('mongodb');
const promClient = require('prom-client');

const app = express();
const port = process.env.PORT || 3000;

// Prometheus metrics setup
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics();

const httpRequestCounter = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
});

const mqttMessageCounter = new promClient.Counter({
  name: 'mqtt_messages_received_total',
  help: 'Total number of MQTT messages received',
});

const mongoInsertCounter = new promClient.Counter({
  name: 'mongo_inserts_total',
  help: 'Total number of MongoDB inserts',
});

// MongoDB setup
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = 'iot_data';
let db;

// MQTT setup
const mqttClient = mqtt.connect('mqtt://mosquitto:1883');
mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
  mqttClient.subscribe('iot/topic');
});

mqttClient.on('message', async (topic, message) => {
  console.log(`Received message on ${topic}: ${message.toString()}`);
  // Track incoming MQTT messages
  mqttMessageCounter.inc();

  try {
    const collection = db.collection('messages');
    await collection.insertOne({ topic, message: message.toString(), timestamp: new Date() });
    // Track MongoDB inserts
    mongoInsertCounter.inc();
    console.log('MongoDB insert success');
  } catch (err) {
    console.error('MongoDB insert error:', err);
  }
});

// MongoDB connect
MongoClient.connect(mongoUri, { useUnifiedTopology: true })
  .then((client) => {
    db = client.db(dbName);
    console.log('Connected to MongoDB');
  })
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.get('/', (req, res) => {
  httpRequestCounter.inc();
  res.send('IoT Data Collector API is running.');
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

