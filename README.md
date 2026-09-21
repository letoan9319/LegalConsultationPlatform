# Legal Consultation Platform

Kết nối luật sư với khách hàng qua real-time chat, hỗ trợ tìm kiếm văn bản pháp luật, phân tích hợp đồng, và tự động hóa quy trình tư vấn pháp lý.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  API Gateway → REST API (Chat Service) → Kafka Producer                       │
│                              ↓                                                 │
│                    WebSocket (Redis Pub/Sub) ← Real-time                      │
│                              ↓                                                 │
│                     Kafka Event Stream + Schema Registry                       │
│                              ↓                                                 │
│  Consumers: Audit Log | AI Service | Metrics | Notifier | Search Indexer     │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Features

- **Real-time Chat**: WebSocket-based communication between lawyers and customers
- **AI Legal Assistant**: RAG-powered legal reference search and consultation summarization
- **Audit Logging**: 365-day compliance audit trail for all operations
- **Anomaly Detection**: ML-based service monitoring with auto-rollback
- **Full-text Search**: Meilisearch integration for legal document retrieval

## Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | Python (FastAPI), aiokafka, asyncpg |
| Event Streaming | Kafka 3.6.0 (Strimzi), Schema Registry |
| Databases | PostgreSQL 16, Redis 7, Meilisearch 1.6 |
| ML | MLflow, Isolation Forest, Autoencoder |
| Deployment | Kubernetes (K3s), Argo CD, Argo Rollouts |
| Serialization | Avro with Schema Registry |

## Project Structure

```
.
├── apps/
│   └── chat-service/           # FastAPI REST + WebSocket
├── services/
│   ├── audit-consumer/         # Audit log persistence
│   ├── ai-consumer/           # AI request processing (RAG)
│   ├── metrics-consumer/       # ML anomaly detection
│   ├── notifier-service/      # Push notifications
│   ├── search-indexer/        # Meilisearch indexing
│   └── ai-analyzer/           # ML rollback triggers
├── ml-engine/                  # ML training pipeline
├── schemas/                    # Avro schemas
├── kafka-connect/              # Kafka Connect CDC configs
└── k8s/                       # Kubernetes manifests
```

## Getting Started

### Prerequisites

- Python 3.11+
- Docker & Docker Compose
- Kubernetes (K3s or OCI)
- Kafka 3.6.0

### Local Development

```bash
# Install dependencies
cd apps/chat-service
pip install -r requirements.txt

# Run chat service
uvicorn src.main:app --reload --port 8000

# Run tests
pytest tests/ -v
```

### Docker

```bash
# Build all services
docker-compose build

# Run with Docker Compose
docker-compose up -d
```

### Kubernetes

```bash
# Apply base configurations
kubectl apply -k k8s/base

# Check pod status
kubectl get pods -n production
```

## Documentation

| Document | Description |
|---------|-------------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture |
| [KAFKA_EVENT_SCHEMA.md](docs/KAFKA_EVENT_SCHEMA.md) | Kafka schemas |
| [PHASE_1_INFRASTRUCTURE.md](docs/PHASE_1_INFRASTRUCTURE.md) | Infrastructure setup |
| [PHASE_2_CORE_SERVICES.md](docs/PHASE_2_CORE_SERVICES.md) | Core services |
| [PHASE_3_CONSUMER_SERVICES.md](docs/PHASE_3_CONSUMER_SERVICES.md) | Kafka consumers |
| [PHASE_4_ML_INTEGRATION.md](docs/PHASE_4_ML_INTEGRATION.md) | ML pipeline |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `KAFKA_BOOTSTRAP_SERVERS` | Kafka broker addresses |
| `SCHEMA_REGISTRY_URL` | Schema Registry URL |
| `SECRET_KEY` | JWT signing key |
| `MLFLOW_TRACKING_URI` | MLflow server URL |

## License

MIT
