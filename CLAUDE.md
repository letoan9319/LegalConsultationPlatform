# CLAUDE.md — Legal Consultation Platform

## Project Overview

**Legal Consultation Platform** kết nối luật sư với khách hàng qua real-time chat, hỗ trợ tìm kiếm văn bản pháp luật, phân tích hợp đồng, và tự động hóa quy trình tư vấn pháp lý.

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

## Tech Stack

- **Backend**: Python (FastAPI), aiokafka, asyncpg
- **Event Streaming**: Kafka 3.6.0 (Strimzi), Schema Registry
- **Databases**: PostgreSQL 16, Redis 7, Meilisearch 1.6
- **ML**: MLflow, Isolation Forest, Autoencoder
- **Deployment**: Kubernetes (K3s on OCI), Argo CD, Argo Rollouts
- **Serialization**: Avro with Schema Registry

## Key Conventions

### Code Style
- Type hints required for all Python functions
- Use `async/await` for I/O operations
- Prefer `pydantic` for data validation
- Use `structlog` for structured logging
- No icons/emojis in code or comments

### Kafka Conventions
- Topic naming: `<domain>.<entity>` (e.g., `chat.message`, `consultation.events`)
- Schema subject naming: `<topic>-value` (e.g., `chat-message-value`)
- Consumer group naming: `<service>-consumer` (e.g., `audit-log-consumer`)
- Retention: audit.log = 365 days, telemetry = 7 days

### Git Conventions
- Branch naming: `feature/`, `fix/`, `chore/`
- Commit format: `<type>(<scope>): <description>`
- PR requires at least 1 review approval

## File Structure

```
legal-consult-aiops/
├── apps/                          # Application services
│   ├── chat-service/             # FastAPI REST + WebSocket
│   │   ├── legal_chat_service/ # Python package source
│   │   └── tests/             # Test suite
│   └── ai-service/             # AI processing (planned)
├── services/                      # Kafka consumer services
│   ├── audit-consumer/           # Audit log persistence
│   ├── ai-consumer/              # AI request processing
│   └── metrics-consumer/         # ML anomaly detection
├── ml-engine/                     # ML training pipeline
│   ├── src/                    # ML source code
│   └── tests/                  # ML test suite
├── schemas/                       # Avro schemas
├── kafka-connect/                # Kafka Connect configs
├── k8s/                          # Kubernetes manifests
│   ├── base/                     # Base kustomize
│   └── overlays/                 # Environment-specific
├── docs/                         # Documentation
└── tests/                        # Test suites (chaos, e2e, integration, performance, unit)
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `REDIS_URL` | Redis connection string | Yes |
| `KAFKA_BOOTSTRAP_SERVERS` | Kafka broker addresses | Yes |
| `SCHEMA_REGISTRY_URL` | Schema Registry URL | Yes |
| `SECRET_KEY` | JWT signing key | Yes |
| `MLFLOW_TRACKING_URI` | MLflow server URL | For ML |

## Common Commands

### Development
```bash
# Run chat service locally (package name: legal_chat_service)
cd apps/chat-service
pip install -e .
uvicorn legal_chat_service.main:app --reload --port 8000

# Run tests
cd apps/chat-service && pytest tests/ -v
# Or for ML tests:
cd ml-engine && pytest tests/ -v
```

### Docker
```bash
# Build chat service
docker build -t chat-service:latest ./apps/chat-service

# Run with docker-compose
docker-compose up -d
```

### Kubernetes
```bash
# Check pods
kubectl get pods -n production

# View logs
kubectl logs -n production -l app=chat-service -f

# Restart deployment
kubectl rollout restart deployment/chat-service -n production

# Check Kafka consumer lag
kubectl exec -n production kafka-client -- \
  kafka-consumer-groups.sh --bootstrap-server legal-kafka:9092 \
  --all-groups --describe
```

## Documentation

| Document | Description |
|---------|-------------|
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture overview |
| [KAFKA_EVENT_SCHEMA.md](docs/KAFKA_EVENT_SCHEMA.md) | Kafka topic schemas |
| [SCHEMA_REGISTRY_USAGE.md](docs/SCHEMA_REGISTRY_USAGE.md) | Schema Registry guide |
| [CONSUMER_GROUPS.md](docs/CONSUMER_GROUPS.md) | Consumer group configuration |
| [PHASE_1_INFRASTRUCTURE.md](docs/PHASE_1_INFRASTRUCTURE.md) | Infrastructure setup |
| [PHASE_2_CORE_SERVICES.md](docs/PHASE_2_CORE_SERVICES.md) | Core services development |
| [PHASE_3_CONSUMER_SERVICES.md](docs/PHASE_3_CONSUMER_SERVICES.md) | Consumer services |
| [PHASE_4_ML_INTEGRATION.md](docs/PHASE_4_ML_INTEGRATION.md) | ML integration |
| [PHASE_5_TESTING.md](docs/PHASE_5_TESTING.md) | Testing & documentation |

## Phase Progress

| Phase | Status | Timeline |
|-------|--------|----------|
| Phase 1: Infrastructure | Completed (2026-09-18) | Week 1-2 |
| Phase 2: Core Services | Completed (2026-09-21) | Week 3-4 |
| Phase 3: Consumer Services | Completed (2026-09-21) | Week 5-6 |
| Phase 4: ML Integration | Completed (2026-09-21) | Week 7 |
| Phase 5: Testing & Docs | Pending | Week 8-9 |

## Important Notes

### Kafka
- Kafka uses **KRaft mode** (no ZooKeeper dependency in production)
- All messages use **Avro serialization** via Schema Registry
- Schema compatibility mode: **BACKWARD**
- Enable idempotence for exactly-once semantics

### Security
- All sensitive config via Kubernetes secrets
- TLS for Kafka inter-broker communication
- JWT authentication for REST API
- Audit logging for compliance (365-day retention)

### Monitoring
- Prometheus metrics exposed on `/metrics`
- Grafana dashboards for visualization
- Argo Rollouts with ML-based rollback on anomalies
- AlertManager for PagerDuty/Slack notifications

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
