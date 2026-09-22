import pytest
from legal_chat_service.ws.manager import ConnectionManager


@pytest.mark.asyncio
async def test_connection_manager_init():
    manager = ConnectionManager(None)
    assert manager is not None
    assert manager.active_connections == {}
