#!/bin/bash
# Register Avro schemas to Schema Registry

set -e

SCHEMA_REGISTRY="${SCHEMA_REGISTRY_URL:-http://schema-registry:8081}"

register_schema() {
    local subject=$1
    local schema_file=$2

    echo "Registering schema: $subject"

    response=$(curl -s -X POST "$SCHEMA_REGISTRY/subjects/$subject/versions" \
        -H "Content-Type: application/vnd.schemaregistry.v1+json" \
        -d "{\"schema\": $(cat "$schema_file")}")

    if echo "$response" | grep -q '"id"'; then
        echo "  Success: $subject registered"
    else
        echo "  Failed: $response"
    fi
}

# Register all schemas
register_schema "chat-message-value" "schemas/chat-message.avsc"
register_schema "consultation-event-value" "schemas/consultation-event.avsc"
register_schema "ai-request-value" "schemas/ai-request.avsc"
register_schema "audit-event-value" "schemas/audit-event.avsc"
register_schema "telemetry-metric-value" "schemas/telemetry-metric.avsc"

echo ""
echo "Schema registration complete"
echo "Registered schemas:"
curl -s "$SCHEMA_REGISTRY/subjects" | jq .
