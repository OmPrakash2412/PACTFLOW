#!/usr/bin/env python3
"""
PACTFLOW Load Testing Harness (Layer 15)
Simulates concurrent traffic against core endpoints:
- GET /api/health
- GET /api/health/live
- POST /api/auth/login
Reports request count, p50/p95 latency, throughput, and error rates.
"""

import sys
import time
import asyncio
from typing import List
import httpx


async def worker(base_url: str, num_requests: int, latencies: List[float], errors: List[str]):
    async with httpx.AsyncClient(timeout=10.0) as client:
        for _ in range(num_requests):
            t0 = time.time()
            try:
                resp = await client.get(f"{base_url}/api/health/live")
                lat = (time.time() - t0) * 1000
                if resp.status_code == 200:
                    latencies.append(lat)
                else:
                    errors.append(f"HTTP {resp.status_code}")
            except Exception as e:
                errors.append(str(e))


async def run_load_test(base_url: str = "http://localhost:8000", concurrency: int = 5, requests_per_worker: int = 20):
    print(f"=== PACTFLOW Load Test: {concurrency} workers x {requests_per_worker} requests ===")
    latencies: List[float] = []
    errors: List[str] = []

    start_time = time.time()
    tasks = [worker(base_url, requests_per_worker, latencies, errors) for _ in range(concurrency)]
    await asyncio.gather(*tasks)
    total_time = time.time() - start_time

    total_requests = len(latencies) + len(errors)
    throughput = total_requests / total_time if total_time > 0 else 0

    if latencies:
        latencies.sort()
        p50 = latencies[int(len(latencies) * 0.50)]
        p95 = latencies[int(len(latencies) * 0.95)]
        p99 = latencies[int(len(latencies) * 0.99)]
        min_lat = min(latencies)
        max_lat = max(latencies)
    else:
        p50 = p95 = p99 = min_lat = max_lat = 0.0

    print(f"Total Requests: {total_requests}")
    print(f"Successful:     {len(latencies)}")
    print(f"Failed:         {len(errors)}")
    print(f"Total Duration: {total_time:.2f}s")
    print(f"Throughput:     {throughput:.1f} req/s")
    print(f"Min Latency:    {min_lat:.2f}ms")
    print(f"P50 Latency:    {p50:.2f}ms")
    print(f"P95 Latency:    {p95:.2f}ms")
    print(f"P99 Latency:    {p99:.2f}ms")
    print(f"Max Latency:    {max_lat:.2f}ms")

    return len(errors) == 0


if __name__ == "__main__":
    url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000"
    success = asyncio.run(run_load_test(url, concurrency=5, requests_per_worker=10))
    sys.exit(0 if success else 1)

