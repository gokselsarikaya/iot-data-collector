# 📡 IoT Data Collector

An end-to-end, containerized IoT data ingestion and monitoring pipeline. It receives MQTT messages, stores them in MongoDB, and provides real-time observability via Prometheus and Grafana — all built using Infrastructure as Code (IaC) principles.

---

## 🚀 Features

- ✅ **MQTT Ingestion** via Mosquitto for receiving device data.
- ✅ **Node.js Backend** consumes MQTT, stores data in MongoDB.
- ✅ **MongoDB Storage** for incoming MQTT messages
- ✅ **Prometheus Metrics** for system observability, scrapes and stores custom metrics
- ✅ **Grafana Dashboards** dashboards for monitoring message rate, DB inserts, HTTP traffic (auto-provisioned via YAML/JSON)
- ✅ **Fully Dockerized Stack** with `docker-compose`
- ✅ Includes Jest-based testing with mocks
- ✅ **Metrics Include**:
  - MQTT messages received
  - MongoDB inserts
  - HTTP API requests


---

## 📁 Folder Structure

```
iot-data-collector/
├── backend/
│   └── api/
│   │   ├── package.json
│   │   ├── Dockerfile
│   │   ├── app.js          # Express app with routes and Prometheus metrics
│   │   ├── index.js        # MQTT + MongoDB integration and app startup
│   │   ├── tests/
│   │   │   ├── api.test.js     # API tests
│   │   │   ├── mqtt.test.js    # MQTT + MongoDB integration tests (mocked)
├── mqtt/
│   ├── config/
│   │   └── mosquitto.conf
│   ├── data/
│   │   └── mosquitto.db
│   └── log/
│       └── mosquitto.log
├── monitoring/
│   ├── grafana/
│   │   └── provisioning/
│   │       ├── dashboards/
│   │       │   └── mqtt-dashboard.json
│   │       └── datasources/
│   │           └── prometheus-ds.yml
│   └── prometheus/
│       └── prometheus.yml
├── docker-compose.yml
└── README.md
```

---


## 📐 Architecture

```text
           [MQTT Device]
                ↓
         ┌────────────────┐
         │   Mosquitto    │
         └────────────────┘
                ↓
         ┌────────────────┐
         │   Node.js App  │◀─── GET /
         └────────────────┘
         ↓               ↓
 [MongoDB Inserts]   [Prometheus /metrics]
                          ↓
                    ┌──────────┐
                    │ Grafana  │
                    └──────────┘
```                  


---

## 🐳 Docker Compose Setup

All services are managed via `docker-compose.yml`.

```bash
git clone https://github.com/gokselsarikaya/iot-data-collector.git
cd iot-data-collector
docker-compose up --build
```

## Access Services

| Service    | URL                                            |
| ---------- | ---------------------------------------------- |
| API        | [http://localhost:3000](http://localhost:3000) |
| Prometheus | [http://localhost:9090](http://localhost:9090) |
| Grafana    | [http://localhost:3001](http://localhost:3001) |

---

## 📈 Monitoring & Observability

- **Metrics Endpoint:** Exposed at `/metrics` by Node.js API.
- **Prometheus:** Scrapes metrics from API.
- **Grafana:** Visualizes metrics via predefined dashboards.

### Metrics:

| Metric                         | Type    | Description                         |
| ------------------------------ | ------- | ----------------------------------- |
| `http_requests_total`          | Counter | Total HTTP requests to `/` route    |
| `mqtt_messages_received_total` | Counter | Total MQTT messages received        |
| `mongo_inserts_total`          | Counter | Total documents inserted into Mongo |


---

## ✅ Grafana Dashboard

Provisioned automatically from:
- `monitoring/grafana/provisioning/dashboards/dashboards.yaml`
- `monitoring/grafana/provisioning/datasources/prometheus.yaml`

Make sure `datasource.uid` in the dashboard matches the Prometheus config (`uid: prometheus`).

---



## 🧪 Sending Test MQTT Messages

You can send test messages using mosquitto_pub (inside the broker container):
```bash
docker exec -it mosquitto sh
mosquitto_pub -h localhost -t iot/topic -m "Test message"
```
Or use MQTT client GUI tools like MQTT Explorer or MQTT.fx.

---
##  Running Tests
```bash
npm install
npm test
```

Tests include:
Basic HTTP route tests (api.test.js)
MQTT + MongoDB insert logic (mocked in mqtt.test.js)

---

## 🛠️ Future Work

- Add alerting rules in Prometheus.
- Improve security (auth, TLS).
- CI/CD setup.


---

## 🙌 Contribution
Feel free to fork or suggest improvements. PRs welcome!

---
