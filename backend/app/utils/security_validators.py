import ipaddress
import re
from urllib.parse import urlparse
from typing import Tuple

BLOCKED_HOSTNAMES = {
    "localhost",
    "127.0.0.1",
    "::1",
    "0.0.0.0",
    "metadata.google.internal",
    "instance-data",
    "169.254.169.254"
}

FORBIDDEN_PORTS = {
    21, 22, 23, 25, 53, 110, 135, 137, 138, 139, 445,
    1433, 1521, 3306, 5432, 6379, 8000, 8080, 8443, 9000, 9200, 11211, 27017
}


def validate_safe_url(url: str) -> Tuple[bool, str]:
    """
    Advanced SSRF Defense Engine:
    Validates user-submitted URLs to ensure zero targeting of cloud metadata,
    loopbacks, private intranets, non-http schemes, alternative numeric encodings,
    or internal administrative service ports.
    """
    if not url or not isinstance(url, str):
        return False, "Invalid URL string provided."

    url_clean = url.strip()
    if len(url_clean) > 2048:
        return False, "URL exceeds maximum allowable length (2048 characters)."

    try:
        parsed = urlparse(url_clean)
    except Exception:
        return False, "Malformed URL structure."

    if parsed.scheme.lower() not in ("http", "https"):
        return False, f"Prohibited URL scheme: '{parsed.scheme}'. Only HTTP and HTTPS are permitted."

    # Prevent embedded credential phishing / SSRF smuggling
    if parsed.username or parsed.password:
        return False, "URLs containing embedded userinfo credentials (user:pass@) are prohibited."

    hostname = (parsed.hostname or "").lower().strip()
    if not hostname:
        return False, "URL must contain a valid hostname."

    # Remove outer brackets from IPv6
    raw_host = hostname.strip("[]")

    # Check known forbidden hostnames
    if raw_host in BLOCKED_HOSTNAMES:
        return False, f"Access to restricted internal/metadata host '{hostname}' is blocked."

    # Prevent alternative numeric encodings (e.g. pure decimal integer host: http://2130706433)
    if raw_host.isdigit():
        try:
            int_ip = ipaddress.ip_address(int(raw_host))
            if int_ip.is_private or int_ip.is_loopback or int_ip.is_reserved:
                return False, f"Numeric IP encoding targeting non-routable address '{hostname}' is blocked."
        except ValueError:
            return False, "Invalid numeric IP representation."

    # Block internal infrastructure service ports
    if parsed.port and parsed.port in FORBIDDEN_PORTS:
        return False, f"Access to restricted port {parsed.port} on '{hostname}' is blocked."

    # Check for direct IPv4 and IPv6 addresses
    try:
        ip = ipaddress.ip_address(raw_host)
        # Check IPv4-mapped IPv6 (e.g. ::ffff:127.0.0.1)
        if isinstance(ip, ipaddress.IPv6Address) and ip.ipv4_mapped:
            ip = ip.ipv4_mapped

        if ip.is_loopback:
            return False, f"Access to loopback IP address '{hostname}' is blocked."
        if ip.is_private:
            return False, f"Access to private intranet IP range '{hostname}' is blocked."
        if ip.is_link_local:
            return False, f"Access to link-local metadata address '{hostname}' is blocked."
        if ip.is_reserved or ip.is_multicast:
            return False, f"Access to reserved IP '{hostname}' is blocked."
    except ValueError:
        # Hostname is a domain name, check for forbidden internal patterns
        if hostname.endswith(".internal") or hostname.endswith(".local") or hostname.endswith(".lan"):
            return False, f"Access to internal domain suffix '{hostname}' is blocked."

    return True, "URL is safe."
