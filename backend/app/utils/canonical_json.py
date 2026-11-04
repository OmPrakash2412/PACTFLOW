import json
from decimal import Decimal
from datetime import datetime, date
from typing import Any


class CanonicalJSONEncoder(json.JSONEncoder):
    def default(self, obj: Any) -> Any:
        if isinstance(obj, Decimal):
            return f"{obj:.2f}"
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        return super().default(obj)


def canonicalize(data: Any) -> str:
    """
    Serializes a dictionary or object into a deterministic canonical JSON string:
    - Keys sorted alphabetically
    - No space separators around delimiters (: and ,)
    - Consistent datetime and Decimal serialization
    """
    return json.dumps(
        data,
        cls=CanonicalJSONEncoder,
        sort_keys=True,
        separators=(',', ':'),
        ensure_ascii=False
    )

