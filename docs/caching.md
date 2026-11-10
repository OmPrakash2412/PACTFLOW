# PACTFLOW: Caching & CDN Strategy

## 1. Caching Tiers

| Asset Type | Storage Layer | TTL | Cache-Control Header | Invalidation Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **Static Next.js JS/CSS Bundles** | Cloudflare / Vercel CDN | 1 Year (31,536,000s) | `public, max-age=31536000, immutable` | Content-hashed filenames on each build |
| **Public Landing Page** | Edge CDN | 1 Hour (3,600s) | `public, s-maxage=3600, stale-while-revalidate=86400` | Automated webhook on deploy |
| **Authenticated API Data** | Client / Browser only | 0s | `private, no-cache, no-store, must-revalidate` | Never cached on shared CDN layers |
| **PayPal OAuth Access Token** | In-Memory / Redis | Token Expiry minus 60s | Internal Memory Cache | Automatic refresh 60s prior to expiry |

---

## 2. Multi-Tenant Cache Key Rules
Any application-level cache (e.g. Redis) holding tenant data MUST prefix cache keys with `organization_id`:
```
cache:org:{organization_id}:project:{project_id}:agreements
```
This guarantees zero cross-tenant cache bleeding.
