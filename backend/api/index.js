const app = require('./app');
const mqtt = require('mqtt');
const { MongoClient } = require('mongodb');
const winston = require('winston');
const promClient = require('prom-client');  // Prometheus client

const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = 'iot_data';
let db;

// Logger
const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
});

// Prometheus metrics
const mongoInsertsCounter = new promClient.Counter({
  name: 'mongo_inserts_total',
  help: 'Total number of MongoDB insert operations',
});

const mqttMessagesCounter = new promClient.Counter({
  name: 'mqtt_messages_received_total',
  help: 'Total number of MQTT messages received',
});


// MongoDB connect
MongoClient.connect(mongoUri, { useUnifiedTopology: true })
  .then((client) => {
    db = client.db(dbName);
    logger.info('Connected to MongoDB');
  })
  .catch((err) => logger.error('MongoDB connection error:', err));

// MQTT setup
const mqttClient = mqtt.connect('mqtt://mosquitto:1883');
mqttClient.on('connect', () => {
  logger.info('Connected to MQTT broker');
  mqttClient.subscribe('iot/topic');
});

mqttClient.on('message', async (topic, message) => {
  logger.info(`Received MQTT message on ${topic}`);
  try {
    const collection = db.collection('messages');
    await collection.insertOne({ topic, message: message.toString(), timestamp: new Date() });
    mongoInsertsCounter.inc();  // Increment MongoDB insert counter
    logger.info('MongoDB insert success');
  } catch (err) {
    logger.error('MongoDB insert error:', err);
  }

  mqttMessagesCounter.inc();  // Increment MQTT message counter
});

// Start server
app.listen(port, () => {
  logger.info(`Server running at http://localhost:${port}`);
});
