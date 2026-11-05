import ipaddress
import re
import socket
from urllib.parse import urlparse
from typing import Tuple


BLOCKED_HOSTNAMES = {
    "localhost",
    "127.0.0.1",
    "::1",
    "metadata.google.internal",
    "instance-data",
    "169.254.169.254"
}


def validate_safe_url(url: str) -> Tuple[bool, str]:
    """
    SSRF Protection: Validates that a user-submitted external URL (demo link or file asset)
    does not target internal network services, cloud metadata endpoints, or non-http protocols.
    """
    if not url or not isinstance(url, str):
        return False, "Invalid URL string provided."

    parsed = urlparse(url.strip())
    if parsed.scheme.lower() not in ("http", "https"):
        return False, f"Prohibited URL scheme: '{parsed.scheme}'. Only HTTP and HTTPS are permitted."

    hostname = (parsed.hostname or "").lower().strip()
    if not hostname:
        return False, "URL must contain a valid hostname."

    # Check known forbidden hostnames
    if hostname in BLOCKED_HOSTNAMES:
        return False, f"Access to restricted internal/metadata host '{hostname}' is blocked."

    # Check for direct IP addresses
    try:
        ip = ipaddress.ip_address(hostname)
        if ip.is_loopback:
            return False, f"Access to loopback IP address '{hostname}' is blocked."
        if ip.is_private:
            return False, f"Access to private intranet IP range '{hostname}' is blocked."
        if ip.is_link_local:
            return False, f"Access to link-local metadata address '{hostname}' is blocked."
        if ip.is_reserved or ip.is_multicast:
            return False, f"Access to reserved IP '{hostname}' is blocked."
    except ValueError:
        # Hostname is a domain name, check for forbidden patterns
        if hostname.endswith(".internal") or hostname.endswith(".local") or hostname.endswith(".lan"):
            return False, f"Access to internal domain suffix '{hostname}' is blocked."

    return True, "URL is safe."
