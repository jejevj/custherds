from abc import ABC, abstractmethod
from typing import Any, Dict, Optional


class PaymentGatewayBase(ABC):
    """Abstract base — semua gateway wajib implement method ini."""

    @abstractmethod
    async def create_invoice(self, amount: float, order_id: str, customer: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        """Buat invoice / payment link."""
        ...

    @abstractmethod
    async def create_virtual_account(self, amount: float, order_id: str, customer: Dict[str, Any], channel: str, **kwargs) -> Dict[str, Any]:
        """Buat virtual account."""
        ...

    @abstractmethod
    async def check_transaction_status(self, transaction_id: str) -> Dict[str, Any]:
        """Cek status transaksi."""
        ...

    @abstractmethod
    async def handle_webhook(self, payload: Dict[str, Any], headers: Dict[str, str]) -> Dict[str, Any]:
        """Proses webhook notifikasi dari gateway."""
        ...

    @abstractmethod
    async def refund(self, transaction_id: str, amount: Optional[float] = None, reason: str = "") -> Dict[str, Any]:
        """Lakukan refund."""
        ...
